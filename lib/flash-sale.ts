import { z } from "zod";

export const FLASH_SALE_KEY = "homepage_flash_sale";
export const flashSaleSchema = z.object({
  enabled: z.boolean(),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  badge: z.string().trim().min(1).max(40),
  buttonText: z.string().trim().min(1).max(60),
  link: z.string().trim().max(500).refine(
    (value) => /^\/(?!\/)/.test(value) && !/[\\\s]/.test(value),
    "Use a site link such as /shop or /shop?category=2.",
  ),
  endsAt: z.iso.datetime(),
});
export type FlashSaleSettings = z.infer<typeof flashSaleSchema>;
export const defaultFlashSale: FlashSaleSettings = {
  enabled: true,
  title: "Green Friday Flash Sale",
  description: "Get massive discounts on our most popular sustainable products. Offer ends in:",
  badge: "Hurry Up!",
  buttonText: "Access Sale Now",
  link: "/shop",
  endsAt: "2026-12-30T19:00:00.000Z",
};

export function parseFlashSale(value?: string | null): FlashSaleSettings {
  if (!value) return defaultFlashSale;
  try {
    return flashSaleSchema.parse(JSON.parse(value));
  } catch {
    return { ...defaultFlashSale, enabled: false };
  }
}

export function getFlashSaleDeadline(days: string, hours: string, previous: string, now: number): string {
  if (!days.trim() && !hours.trim()) return previous;
  if ((days.trim() && !/^\d+$/.test(days)) || (hours.trim() && !/^\d+$/.test(hours))) {
    throw new Error("Enter whole numbers for days and hours.");
  }
  const d = Number(days);
  const h = Number(hours);
  if (d < 0 || d > 365 || h < 0 || h > 23 || d * 24 + h <= 0) {
    throw new Error("Set a duration from 1 hour to 365 days and 23 hours.");
  }
  return new Date(now + (d * 24 + h) * 3600000).toISOString();
}
