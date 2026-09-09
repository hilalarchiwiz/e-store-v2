"use server";

import prisma from "@/lib/prisma";
import { withPermission } from "@/lib/action-utils";
import { revalidatePath } from "next/cache";
import { FLASH_SALE_KEY, flashSaleSchema, getFlashSaleDeadline, parseFlashSale } from "@/lib/flash-sale";

export async function saveFlashSale(_previous: unknown, form: FormData) {
  return withPermission("settings_update", async () => {
    const record = await prisma.setting.findUnique({ where: { key: FLASH_SALE_KEY } });
    const previous = parseFlashSale(record?.value);
    const text = (key: string) => String(form.get(key) ?? "").trim();
    const endsAt = getFlashSaleDeadline(text("days"), text("hours"), previous.endsAt, Date.now());
    const result = flashSaleSchema.safeParse({
      enabled: form.get("enabled") === "on",
      title: text("title"), description: text("description"), badge: text("badge"),
      buttonText: text("buttonText"), link: text("link"), endsAt,
    });
    if (!result.success) return { success: false, message: result.error.issues[0].message };
    if (result.data.enabled && Date.parse(endsAt) <= Date.now()) {
      return { success: false, message: "This countdown has ended. Enter a new duration to show the sale." };
    }
    const value = JSON.stringify(result.data);
    await prisma.setting.upsert({
      where: { key: FLASH_SALE_KEY }, create: { key: FLASH_SALE_KEY, value }, update: { value },
    });
    revalidatePath("/");
    revalidatePath("/admin/setting/flash-sale");
    return { success: true, message: "Homepage flash sale updated." };
  });
}
