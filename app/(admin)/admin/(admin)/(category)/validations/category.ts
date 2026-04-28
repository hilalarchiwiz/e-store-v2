import { z } from "zod";

export const CategorySchema = z.object({
    title: z.string().nonempty({
        message: "Title is required",
    }).min(2, "Title must be at least 2 characters").max(100),
    description: z.string().max(500).optional().or(z.literal('')),
});

export type CategoryInput = z.infer<typeof CategorySchema>;