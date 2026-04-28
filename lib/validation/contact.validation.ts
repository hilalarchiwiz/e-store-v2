import { z } from "zod";

export const ContactSchema = z.object({
    name: z
        .string({ required_error: "Name is required" })
        .trim()
        .min(1, "Name is required")
        .min(2, "Name must be at least 2 characters"),

    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .min(1, "Email is required")
        .email("Invalid email format"),

    subject: z
        .string({ required_error: "Subject is required" })
        .trim()
        .min(1, "Subject is required")
        .min(5, "Subject must be at least 5 characters"),

    phone: z
        .string({ required_error: "Phone is required" })
        .trim()
        .min(1, "Phone is required")
        .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone format (e.g. +123456789)"),

    message: z
        .string({ required_error: "Message is required" })
        .trim()
        .min(1, "Message is required")
        .min(10, "Message must be at least 10 characters"),
});
// Create a type from the schema for TypeScript power
export type ContactInput = z.infer<typeof ContactSchema>;