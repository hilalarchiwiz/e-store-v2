import { z } from "zod";

export const gradingSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
});