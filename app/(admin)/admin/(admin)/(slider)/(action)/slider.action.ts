'use server'

import { uploadImage } from "@/lib/action/FileUpload";
import { PAGE_SIZE } from "@/lib/constant";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { withPermission } from "@/lib/action-utils";
import { SliderSchema } from "../validations/slider";

// 1. Get All Sliders
export async function getSliders(searchParams: { search?: string; page?: string; limit?: string }) {
    return withPermission('slider_view', async () => {
        const query = searchParams.search || "";
        const currentPage = Number(searchParams.page) || 1;
        const itemsPerPage = Number(searchParams.limit) || PAGE_SIZE;
        const skip = (currentPage - 1) * itemsPerPage;

        const whereClause = query ? {
            OR: [
                { title: { contains: query, mode: 'insensitive' as const } },
                { description: { contains: query, mode: 'insensitive' as const } },
            ]
        } : {};

        const [sliders, totalCount] = await Promise.all([
            prisma.slider.findMany({
                where: whereClause,
                skip: skip,
                take: itemsPerPage,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.slider.count({ where: whereClause })
        ]);

        return {
            success: true,
            sliders,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            totalCount: totalCount ?? 0
        };
    });
}

// 2. Create Slider
export async function createSlider(prevData: any, formData: FormData) {
    return withPermission('slider_create', async () => {
        const rawData = {
            title: formData.get('title'),
            description: formData.get('description'),
            status: formData.get('status'),
            link: formData.get('link'),
        };

        const validatedFields = SliderSchema.safeParse(rawData);
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
        // Handle Image Upload
        const imageUrlResponse = await uploadImage(formData);
        if (!imageUrlResponse.success) {
            return {
                success: false,
                message: imageUrlResponse.message,
            };
        }
        const { title, description, link, status } = validatedFields.data;
        await prisma.slider.create({
            data: {
                title,
                description: description ?? '',
                img: imageUrlResponse.url || '',
                link,
                status,
            },
        });

        revalidatePath('/admin/slider');
        revalidatePath('/');
        return { success: true, message: 'Slider created successfully' };
    });
}

// 3. Get Single Slider
export async function getSingleSlider(sliderId: number) {
    return withPermission('slider_update', async () => {
        const slider = await prisma.slider.findUnique({
            where: { id: sliderId }
        });

        if (!slider) throw new Error('Slider not found');

        return {
            success: true,
            slider: slider
        };
    });
}

// 4. Update Slider
export async function updateSlider(id: number | undefined, prevData: any, formData: FormData) {
    return withPermission('slider_update', async () => {
        if (!id) throw new Error("Slider ID is required");

        const rawData = {
            title: formData.get('title'),
            description: formData.get('description'),
            status: formData.get('status'),
            link: formData.get('link'),
        };

        const validatedFields = SliderSchema.safeParse(rawData);

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
        const { title, description, link, status } = validatedFields.data;

        const updateData: any = { title, description, link, status };

        // Check if a new image was provided
        const imageFile = formData.get('image');
        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            const imageUrlResponse = await uploadImage(formData);
            if (!imageUrlResponse.success) {
                return {
                    success: false,
                    message: imageUrlResponse.message,
                }
            };
            updateData.img = imageUrlResponse.url;
        }

        await prisma.slider.update({
            where: { id },
            data: updateData,
        });

        revalidatePath('/admin/slider');
        revalidatePath('/');
        return { success: true, message: 'Slider updated successfully' };
    });
}

// 5. Delete Slider
export async function deleteSlider(sliderId: string) {
    return withPermission('slider_delete', async () => {
        await prisma.slider.delete({
            where: { id: Number(sliderId) },
        });

        revalidatePath('/admin/slider');
        revalidatePath('/');
        return { success: true, message: 'Slider deleted successfully' };
    });
}