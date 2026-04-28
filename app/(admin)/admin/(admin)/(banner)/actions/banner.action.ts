'use server';

import { withPermission } from "@/lib/action-utils";
import { uploadImage } from "@/lib/action/FileUpload";
import { PAGE_SIZE } from "@/lib/constant";
import prisma from "@/lib/prisma";
import { bannerSchema } from "../validators/banner.validator";
import { revalidatePath } from "next/cache";

// ===================== GET =====================

export async function getBanners(searchParams: any) {
    return withPermission("banner_view", async () => {

        const query = searchParams.search || "";
        const currentPage = Number(searchParams.page) || 1;
        const itemsPerPage = Number(searchParams.limit) || PAGE_SIZE;
        const skip = (currentPage - 1) * itemsPerPage;

        const where = query
            ? {
                OR: [
                    { title: { contains: query, mode: "insensitive" as const } },
                    { description: { contains: query, mode: "insensitive" as const } }
                ]
            }
            : {};

        const [banners, totalCount] = await Promise.all([
            prisma.banner.findMany({ where, skip, take: itemsPerPage, orderBy: { createdAt: "desc" } }),
            prisma.banner.count({ where })
        ]);

        return {
            success: true,
            banners,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            totalCount
        };
    });
}

// ===================== CREATE =====================

export async function createBanner(_: any, formData: FormData) {
    return withPermission("banner_create", async () => {

        const parsed = bannerSchema.safeParse(Object.fromEntries(formData));
        if (!parsed.success) {
            return { success: false, message: parsed.error.issues[0].message };
        }

        const imageUpload = await uploadImage(formData);
        if (!imageUpload.success) {
            return { success: false, message: imageUpload.message };
        }

        await prisma.banner.create({
            data: {
                title: parsed.data.title,
                type: parsed.data.bannerType,
                description: parsed.data.description ?? "",
                link: parsed.data.link ?? "",
                buttonText: parsed.data.buttonText ?? "",
                bgColor: parsed.data.bgColor ?? "",
                imageUrl: imageUpload.url || "",
                order: 1
            }
        });
        revalidatePath('/admin/banner')
        return { success: true, message: "Banner created successfully" };
    });
}

// ===================== UPDATE =====================

export async function updateBanner(id: string, _: any, formData: FormData) {
    return withPermission("banner_update", async () => {

        const parsed = bannerSchema.safeParse(Object.fromEntries(formData));
        if (!parsed.success) {
            return { success: false, message: parsed.error.issues[0].message };
        }

        let imageUrl: string | undefined;
        const file = formData.get("image");

        if (file instanceof File && file.size > 0) {
            const upload = await uploadImage(formData);
            if (!upload.success) return { success: false, message: upload.message };
            imageUrl = upload.url;
        }

        await prisma.banner.update({
            where: { id: Number(id) },
            data: {
                title: parsed.data.title,
                type: parsed.data.bannerType,
                description: parsed.data.description ?? "",
                link: parsed.data.link ?? "",
                buttonText: parsed.data.buttonText ?? "",
                bgColor: parsed.data.bgColor ?? "",
                ...(imageUrl && { imageUrl })
            }
        });
        revalidatePath('/admin/banner')
        return { success: true, message: "Banner updated successfully" };
    });
}

// ===================== DELETE =====================

export async function deleteBanner(id: string) {
    return withPermission("banner_delete", async () => {
        await prisma.banner.delete({ where: { id: Number(id) } });
        revalidatePath('/admin/banner')
        return { success: true, message: "Banner deleted successfully" };
    });
}

// ===================== GET BY ID =====================

export async function getBannerById(id: string) {
    return withPermission("banner_edit", async () => {
        const banner = await prisma.banner.findUnique({ where: { id: Number(id) } });
        return { success: true, banner };
    });
}
