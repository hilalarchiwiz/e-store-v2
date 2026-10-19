import assert from "node:assert/strict";
import test from "node:test";
import { PRODUCT_SLUG_REDIRECTS } from "../lib/product-redirects";

test("reported legacy redirects have no loops, chains or guessed numeric destinations", () => {
  assert.equal(Object.keys(PRODUCT_SLUG_REDIRECTS).length, 6);
  assert.equal(PRODUCT_SLUG_REDIRECTS["7"], undefined);
  for (const [source, destination] of Object.entries(PRODUCT_SLUG_REDIRECTS)) {
    assert.notEqual(source, destination);
    assert.equal(PRODUCT_SLUG_REDIRECTS[destination], undefined);
  }
});

test("product lookup resolves exact slugs, IDs and recorded slug changes while respecting visibility", async () => {
  const products = [
    { id: 42, slug: "new-slug", status: "active", quantity: 1 },
    { id: 43, slug: "42", status: "active", quantity: 1 },
    { id: 44, slug: "hidden", status: "inactive", quantity: 1 },
    { id: 45, slug: "sold-out", status: "active", quantity: 0 },
  ];
  const history: Record<string, string> = {
    "old-slug": "42", "older-slug": "42", "hidden-slug": "44",
    "sold-out-slug": "45", "deleted-slug": "99",
  };
  (globalThis as any).prismaGlobal = {
    setting: { findUnique: async () => ({ value: '{"showOutOfStock":false}' }) },
    product: {
      findFirst: async ({ where }: any) => products.find((p) =>
        p.status === where.status && (!where.quantity || p.quantity > where.quantity.gt) &&
        (where.slug !== undefined ? p.slug === where.slug : p.id === where.id)) ?? null,
    },
    auditLog: {
      findFirst: async ({ where }: any) => {
        const entityId = history[where.oldData.equals];
        return entityId ? { entityId } : null;
      },
    },
  };
  const { getStorefrontProduct } = await import("../lib/storefront-product");
  assert.equal((await getStorefrontProduct("new-slug"))?.id, 42);
  assert.equal((await getStorefrontProduct("42"))?.id, 43);
  assert.equal((await getStorefrontProduct("43"))?.id, 43);
  assert.equal((await getStorefrontProduct("old-slug"))?.slug, "new-slug");
  assert.equal((await getStorefrontProduct("older-slug"))?.slug, "new-slug");
  for (const slug of ["missing", "hidden", "hidden-slug", "sold-out-slug", "deleted-slug", "999999999999999999999999"]) {
    assert.equal(await getStorefrontProduct(slug), null);
  }
});
