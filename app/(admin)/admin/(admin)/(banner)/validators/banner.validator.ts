import { z } from "zod";
import { BannerType } from "@prisma/client";

export const bannerSchema = z.object({
    title: z.string().min(2, "Title is required"),
    bannerType: z.nativeEnum(BannerType),
    description: z.string().optional(),
    link: z.string().url("Invalid URL").optional(),
    buttonText: z.string().optional(),
    bgColor: z.string().optional()
});

export type Banner = z.infer<typeof bannerSchema>;