'use server';

import { withPermission } from "@/lib/action-utils";
import { uploadImage } from "@/lib/action/FileUpload";
import { PAGE_SIZE } from "@/lib/constant";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BrandSchema } from "../validations/brand";

// List Brands
export async function getBrands(searchParams: { search?: string; page?: string; limit?: string }) {
    return withPermission('brand_view', async () => {
        const query = searchParams.search || "";
        const currentPage = Number(searchParams.page) || 1;
        const itemsPerPage = Number(searchParams.limit) || PAGE_SIZE;
        const skip = (currentPage - 1) * itemsPerPage;

        const whereClause = query ? {
            title: { contains: query, mode: 'insensitive' as const }
        } : {};

        const [brands, totalCount] = await Promise.all([
            prisma.brand.findMany({
                where: whereClause,
                skip,
                take: itemsPerPage,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.brand.count({ where: whereClause })
        ]);

        return {
            success: true,
            brands,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            totalCount: totalCount ?? 0
        };
    });
}

// Create Brand
export async function createBrand(prevData: any, formData: FormData) {
    return await withPermission('brand_create', async () => {
        const validatedFields = BrandSchema.safeParse({
            title: formData.get('title'),
        });

        if (!validatedFields.success) {
            const errors = validatedFields.error.flatten().fieldErrors;
            // Get first error only
            const firstErrorField = Object.keys(errors)[0];
            const firstErrorMessage = errors[firstErrorField][0];

            return {
                success: false,
                errors,
                message: firstErrorMessage,
            };
        }

        const { title } = validatedFields.data;
        const exists = await prisma.brand.findFirst({
            where: { title: { equals: title, mode: 'insensitive' } }
        });

        if (exists) {
            return {
                success: false,
                message: "Brand already exists"
            };
        }
        await prisma.brand.create({
            data: {
                title,
                status: 'active',
                description: '',
                img: '',
            }
        });

        revalidatePath('/admin/brand');
        revalidatePath('/');
        return { success: true, message: "Brand created successfully" };
    });
}

// Get Single Brand
export async function getBrandById(brandId: string) {
    return withPermission('brand_update', async () => {
        const brand = await prisma.brand.findUnique({
            where: { id: Number(brandId) }
        });
        return { success: true, brand };
    });
}

// Update Brand
export async function updateBrand(id: number | undefined, prevData: any, formData: FormData) {
    return await withPermission('brand_update', async () => {
        if (!id) throw new Error("Brand ID is required for update");

        const validatedFields = BrandSchema.safeParse({
            title: formData.get('title'),
        });

        if (!validatedFields.success) {
            const errors = validatedFields.error.flatten().fieldErrors;
            // Get first error only
            const firstErrorField = Object.keys(errors)[0];
            const firstErrorMessage = errors[firstErrorField][0];
            return {
                success: false,
                errors,
                message: firstErrorMessage,
            };
        }

        const { title } = validatedFields.data;
        // 🔒 UNIQUE CHECK (ignore current brand)
        const exists = await prisma.brand.findFirst({
            where: {
                title: { equals: title, mode: 'insensitive' },
                NOT: { id }
            }
        });

        if (exists) {
            return {
                success: false,
                message: "Another brand with this title already exists"
            };
        }
        const updateData: any = {
            title
        };

        await prisma.brand.update({
            where: { id },
            data: updateData
        });

        revalidatePath('/admin/brand');
        revalidatePath('/');
        return { success: true, message: "Brand updated successfully" };
    });
}

// Delete Brand
export async function deleteBrand(brandId: string) {
    return withPermission('brand_delete', async () => {
        await prisma.brand.delete({
            where: { id: Number(brandId) }
        });

        revalidatePath('/admin/brand');
        revalidatePath('/');
        return { success: true, message: "Brand deleted successfully" };
    });
}