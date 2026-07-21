"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath, updateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { withPermission } from "@/lib/action-utils";
import { userContext } from "@/lib/user-context";
import type {
  ErpSoldReviewInput,
  PendingErpSoldItem,
} from "@/types/erp-sold";

interface QaamProduct {
  id: number;
  title: string;
  quantity: number;
}

interface ErpSpecification {
  key?: string | null;
  value?: string | null;
}

interface ErpProduct {
  id?: number | string;
  unique_id?: number | string | null;
  title?: string;
  sold?: boolean | number | string;
  scrapped?: boolean | number | string;
  units?: number | string;
  updated_at?: string | null;
  updatedAt?: string | null;
  specifications?: ErpSpecification[];
}

interface ErpSearchResponse {
  success?: boolean;
  message?: string;
  products?: ErpProduct[];
}

interface ProductGroup {
  queryTitle: string;
  products: QaamProduct[];
}

const ERP_API_BASE_URL = (process.env.ERP_API_BASE_URL || "https://erp.archiwiz.com")
  .trim()
  .replace(/\/$/, "");
const ERP_SOLD_AUDIT_ENTITY = "ErpSoldItem";
const ERP_SEARCH_CONCURRENCY = 6;

const getNormalizedTitleWords = (value: string): string[] =>
  value
    .normalize("NFKD")
    .toLocaleLowerCase("en")
    .match(/[\p{L}\p{N}]+/gu) || [];

const getProductTitleKey = (title: string) =>
  getNormalizedTitleWords(title).slice(0, 3).join(" ");

const hasMatchingProductTitle = (searchTitle: string, erpTitle: string) => {
  const searchWords = getNormalizedTitleWords(searchTitle);
  const erpWords = getNormalizedTitleWords(erpTitle);

  return searchWords.length >= 3
    && erpWords.length >= 3
    && searchWords.slice(0, 3).every((word, index) => erpWords[index] === word);
};

const getErpBoolean = (value: ErpProduct["sold"]) => {
  if (typeof value === "string") {
    return ["1", "true", "yes"].includes(value.trim().toLocaleLowerCase("en"));
  }

  return value === true || value === 1;
};

const getErpUnits = (value: ErpProduct["units"]) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
};

const getErpUpdatedAt = (product: ErpProduct) => {
  const rawValue = product.updated_at ?? product.updatedAt;
  if (!rawValue) return null;

  const timestamp = new Date(rawValue);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString();
};

const getErpProductId = (product: ErpProduct) => {
  const value = product.id ?? product.unique_id;
  return value === null || value === undefined ? null : String(value);
};

const getErpSoldEventKey = (product: ErpProduct) => {
  const productId = getErpProductId(product);
  if (!productId) return null;

  return `erp-sold:${productId}:${getErpUpdatedAt(product) || "no-updated-at"}`;
};

const getProductMatchScore = (productTitle: string, erpProduct: ErpProduct) => {
  const erpDetails = [
    erpProduct.title || "",
    ...(erpProduct.specifications || []).flatMap((specification) => [
      specification.key || "",
      specification.value || "",
    ]),
  ].join(" ");
  const erpWords = new Set(getNormalizedTitleWords(erpDetails));

  return getNormalizedTitleWords(productTitle)
    .slice(3)
    .reduce((score, word) => score + (erpWords.has(word) ? 1 : 0), 0);
};

const selectQaamProduct = (products: QaamProduct[], erpProduct: ErpProduct) =>
  [...products].sort((left, right) => {
    const scoreDifference = getProductMatchScore(right.title, erpProduct)
      - getProductMatchScore(left.title, erpProduct);

    if (scoreDifference !== 0) return scoreDifference;
    return left.id - right.id;
  })[0];

async function fetchErpProductsByTitle(title: string) {
  const response = await fetch(
    `${ERP_API_BASE_URL}/api/products/count3?title=${encodeURIComponent(title)}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    },
  );
  const data = await response.json().catch(() => null) as ErpSearchResponse | null;

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || `ERP search failed for ${title}.`);
  }

  return Array.isArray(data.products) ? data.products : [];
}

async function findCurrentSoldErpProduct(product: QaamProduct, eventKey: string) {
  const titleKey = getProductTitleKey(product.title);
  if (getNormalizedTitleWords(titleKey).length < 3) return null;

  const matches = await fetchErpProductsByTitle(titleKey);
  return matches.find((match) => (
    typeof match.title === "string"
    && hasMatchingProductTitle(product.title, match.title)
    && getErpBoolean(match.sold)
    && !getErpBoolean(match.scrapped)
    && getErpSoldEventKey(match) === eventKey
  )) || null;
}

export async function getPendingErpSoldItems() {
  return withPermission("product_update", async () => {
    const products = await prisma.product.findMany({
      where: { status: "active" },
      orderBy: { id: "asc" },
      select: { id: true, title: true, quantity: true },
    });

    const groupedProducts = new Map<string, ProductGroup>();
    for (const product of products) {
      const titleKey = getProductTitleKey(product.title);
      if (getNormalizedTitleWords(titleKey).length < 3) continue;

      const existingGroup = groupedProducts.get(titleKey);
      if (existingGroup) existingGroup.products.push(product);
      else groupedProducts.set(titleKey, { queryTitle: titleKey, products: [product] });
    }

    const groups = [...groupedProducts.values()];
    const detectedItems = new Map<string, PendingErpSoldItem>();
    let failedSearches = 0;

    for (let index = 0; index < groups.length; index += ERP_SEARCH_CONCURRENCY) {
      const groupBatch = groups.slice(index, index + ERP_SEARCH_CONCURRENCY);
      const batchResults = await Promise.all(groupBatch.map(async (group) => {
        try {
          return {
            group,
            products: await fetchErpProductsByTitle(group.queryTitle),
            failed: false,
          };
        } catch {
          return { group, products: [] as ErpProduct[], failed: true };
        }
      }));

      for (const result of batchResults) {
        if (result.failed) {
          failedSearches += 1;
          continue;
        }

        for (const erpProduct of result.products) {
          if (
            typeof erpProduct.title !== "string"
            || !hasMatchingProductTitle(result.group.queryTitle, erpProduct.title)
            || !getErpBoolean(erpProduct.sold)
            || getErpBoolean(erpProduct.scrapped)
          ) continue;

          const eventKey = getErpSoldEventKey(erpProduct);
          const erpProductId = getErpProductId(erpProduct);
          const matchedProduct = selectQaamProduct(result.group.products, erpProduct);
          if (!eventKey || !erpProductId || !matchedProduct) continue;

          detectedItems.set(eventKey, {
            eventKey,
            erpProductId,
            erpUniqueId: erpProduct.unique_id === null || erpProduct.unique_id === undefined
              ? null
              : String(erpProduct.unique_id),
            erpTitle: erpProduct.title.trim(),
            erpUpdatedAt: getErpUpdatedAt(erpProduct),
            units: getErpUnits(erpProduct.units),
            productId: matchedProduct.id,
            productTitle: matchedProduct.title,
            currentQuantity: matchedProduct.quantity,
          });
        }
      }
    }

    const eventKeys = [...detectedItems.keys()];
    const reviewedEvents = eventKeys.length > 0
      ? await prisma.auditLog.findMany({
          where: {
            entityName: ERP_SOLD_AUDIT_ENTITY,
            entityId: { in: eventKeys },
          },
          select: { entityId: true },
        })
      : [];
    const reviewedEventKeys = new Set(reviewedEvents.map((event) => event.entityId));
    const items = [...detectedItems.values()]
      .filter((item) => !reviewedEventKeys.has(item.eventKey))
      .sort((left, right) => {
        if (left.erpUpdatedAt && right.erpUpdatedAt) {
          return right.erpUpdatedAt.localeCompare(left.erpUpdatedAt);
        }
        if (left.erpUpdatedAt) return -1;
        if (right.erpUpdatedAt) return 1;
        return left.erpTitle.localeCompare(right.erpTitle);
      });

    if (groups.length > 0 && failedSearches === groups.length) {
      return {
        success: false,
        message: "ERP sold-item check is currently unavailable.",
        items: [] as PendingErpSoldItem[],
      };
    }

    return {
      success: true,
      items,
      warning: failedSearches > 0
        ? `${failedSearches} product ${failedSearches === 1 ? "title was" : "titles were"} not checked because ERP did not respond.`
        : null,
    };
  });
}

export async function reviewErpSoldItem(input: ErpSoldReviewInput) {
  return withPermission("product_update", async () => {
    if (
      !input
      || !Number.isInteger(input.productId)
      || input.productId <= 0
      || !["APPROVED", "REJECTED"].includes(input.decision)
      || typeof input.eventKey !== "string"
      || !input.eventKey.startsWith("erp-sold:")
    ) {
      throw new Error("Invalid ERP sold-item review request.");
    }

    const product = await prisma.product.findUnique({
      where: { id: input.productId },
      select: { id: true, title: true, quantity: true },
    });
    if (!product) throw new Error("The matching QAAM product no longer exists.");

    const erpProduct = await findCurrentSoldErpProduct(product, input.eventKey);
    if (!erpProduct) {
      throw new Error("This ERP sold record changed or is no longer available. Refresh the dashboard.");
    }

    const units = getErpUnits(erpProduct.units);
    const erpProductId = getErpProductId(erpProduct);
    if (!erpProductId || typeof erpProduct.title !== "string") {
      throw new Error("ERP returned an invalid sold record.");
    }
    const erpTitle = erpProduct.title.trim();

    const result = await prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw(
        Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${input.eventKey}))`,
      );

      const existingReview = await transaction.auditLog.findFirst({
        where: {
          entityName: ERP_SOLD_AUDIT_ENTITY,
          entityId: input.eventKey,
        },
        select: { action: true },
      });
      if (existingReview) {
        return {
          alreadyReviewed: true,
          quantityBefore: product.quantity,
          quantityAfter: product.quantity,
        };
      }

      await transaction.$queryRaw(
        Prisma.sql`SELECT "id" FROM "Product" WHERE "id" = ${product.id} FOR UPDATE`,
      );

      const currentProduct = await transaction.product.findUnique({
        where: { id: product.id },
        select: { quantity: true },
      });
      if (!currentProduct) throw new Error("The matching QAAM product no longer exists.");

      const quantityBefore = currentProduct.quantity;
      const quantityAfter = input.decision === "APPROVED"
        ? Math.max(0, quantityBefore - units)
        : quantityBefore;

      if (input.decision === "APPROVED" && quantityAfter !== quantityBefore) {
        await transaction.product.updateMany({
          where: { id: product.id },
          data: { quantity: quantityAfter },
        });
      }

      await transaction.auditLog.create({
        data: {
          entityName: ERP_SOLD_AUDIT_ENTITY,
          entityId: input.eventKey,
          action: input.decision,
          newData: {
            decision: input.decision,
            erpProductId,
            erpUniqueId: erpProduct.unique_id === null || erpProduct.unique_id === undefined
              ? null
              : String(erpProduct.unique_id),
            erpTitle,
            erpUpdatedAt: getErpUpdatedAt(erpProduct),
            units,
            productId: product.id,
            productTitle: product.title,
            quantityBefore,
            quantityAfter,
          },
          changedBy: userContext.getStore() || "SYSTEM",
        },
      });

      return { alreadyReviewed: false, quantityBefore, quantityAfter };
    });

    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath(`/product/${product.id}`);
    updateTag("products");

    if (result.alreadyReviewed) {
      return {
        success: true,
        message: "This ERP sold item was already reviewed.",
      };
    }

    return {
      success: true,
      message: input.decision === "APPROVED"
        ? `Approved. ${product.title} quantity changed from ${result.quantityBefore} to ${result.quantityAfter}.`
        : "ERP sold item rejected. QAAM quantity was not changed.",
      quantity: result.quantityAfter,
    };
  });
}
