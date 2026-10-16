import { z } from "zod";
import { ProductSchema } from "./product";

// Only these fields may be written by the content editor.
export const ProductContentSchema = z.object({
  title: z.string().trim().pipe(ProductSchema.shape.title),
  description: z.string().trim().pipe(ProductSchema.shape.description),
  additionalInfo: z.string(),
});

export type ProductContentInput = z.infer<typeof ProductContentSchema>;
