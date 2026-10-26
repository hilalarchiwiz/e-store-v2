import { z } from "zod";
import { ProductSchema } from "./product";
import { plainText } from "@/lib/seo";

// Only these fields may be written by the content editor.
export const ProductContentSchema = z.object({
  title: z.string().trim().pipe(ProductSchema.shape.title),
  description: z.string().trim().refine(
    (value) => ProductSchema.shape.description.safeParse(plainText(value)).success,
    { message: "Description must contain at least 10 characters of text." },
  ),
  additionalInfo: z.string(),
});

export type ProductContentInput = z.infer<typeof ProductContentSchema>;
