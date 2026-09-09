"use server";

import prisma from "@/lib/prisma";
import { withPermission } from "@/lib/action-utils";
import { revalidatePath, updateTag } from "next/cache";
import { PRODUCT_VISIBILITY_KEY } from "@/lib/product-visibility";

export async function saveProductVisibility(_previous: unknown, form: FormData) {
  return withPermission("settings_update", async () => {
    const selection = form.get("showOutOfStock");
    if (selection !== "show" && selection !== "hide") {
      return { success: false, message: "Choose whether to show or hide out-of-stock products." };
    }
    const value = JSON.stringify({ showOutOfStock: selection === "show" });
    await prisma.setting.upsert({
      where: { key: PRODUCT_VISIBILITY_KEY },
      create: { key: PRODUCT_VISIBILITY_KEY, value },
      update: { value },
    });
    for (const tag of ["products", "categories", "brands"]) updateTag(tag);
    revalidatePath("/", "layout");
    revalidatePath("/sitemap.xml");
    return { success: true, message: "Product visibility updated across the storefront." };
  });
}
