import { z } from "zod";

export const ProductSchema = z.object({
    title: z.string().nonempty({
        message: "Title is required",
    }).min(5, "Title will be at least 5 character").max(200),
    description: z.string().nonempty({
        message: "Description is required",
    }).min(10, "Description will be at least 10 character"),
    warranty: z.string().nonempty({
        message: "Warranty is required",
    }),
    price: z.string().nonempty({
        message: "Price is required",
    }),
    quantity: z.string().nonempty({
        message: "Quantity is required",
    }),
    brand_id: z.string().nonempty({
        message: "brand is required",
    }),
    category_id: z.string().nonempty({
        message: "category is required",
    }),
    images: z.array(z.string()).min(1, "At least one image is required"),
    additionalInfo: z.string().optional().default(''),
    // specifications: z.record(z.string()).default({}),
});

export type ProductInput = z.infer<typeof ProductSchema>;