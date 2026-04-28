import { z } from "zod";

export const PageSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    content: z.string().min(10, "Answer must be at least 10 characters"),
});