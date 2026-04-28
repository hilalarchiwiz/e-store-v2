import { z } from "zod";

export const BrandSchema = z.object({
    title: z.string()
        .nonempty({
            message: "Title is required",
        })
        .min(3, "Title must be at least 3 characters")
        .max(50, "Title must be under 50 characters"),
});

export type BrandInput = z.infer<typeof BrandSchema>;