import { z } from "zod";

export const SliderSchema = z.object({
    title: z.string().nonempty({
        message: "Title is required",
    }).min(5, "Title at least 5 character").max(100),
    description: z.string().max(500).optional().or(z.literal('')),
    link: z.string().nonempty({
        message: "Link is required",
    }).url("Please enter a valid URL").or(z.literal('')),
    status: z.enum(['active', 'inactive']).default('active'),
});

export type SliderInput = z.infer<typeof SliderSchema>;