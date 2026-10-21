import { z } from "zod";

export const ProductSeoSchema = z.object({
  metaDescription: z.string().trim(),
  metaKeywords: z.string().trim(),
});

export type ProductSeoInput = z.infer<typeof ProductSeoSchema>;
