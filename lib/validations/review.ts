// @/lib/validations/review.ts
import { z } from "zod";

export const ReviewSchema = z.object({
    rating: z.coerce.number().min(1, "Please select a rating").max(5),
    comment: z.string().min(5, "Comment must be at least 5 characters").max(500),
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    productId: z.coerce.number().min(1, "Invalid Product ID"),
});