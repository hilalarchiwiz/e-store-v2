'use server'

import { CategorySchema } from './../validations/category';
import { withPermission } from "@/lib/action-utils"
import { uploadImage } from '@/lib/action/FileUpload'
import { PAGE_SIZE } from '@/lib/constant'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// 1. Get All Categories
export async function getCategories(searchParams: { search?: string; page?: string; limit?: string }) {
    return withPermission('category_view', async () => {
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

        const [categories, totalCount] = await Promise.all([
            prisma.category.findMany({
                where: whereClause,
                skip: skip,
                take: itemsPerPage,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.category.count({ where: whereClause })
        ]);

        return {
            success: true,
            categories,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            totalCount: totalCount ?? 0
        };
    });
}

// 2. Create Category
export async function createCategory(prevData: any, formData: FormData) {
    return await withPermission('category_create', async () => {
        const rawData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
        }

        const validatedFields = CategorySchema.safeParse(rawData);

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
        const imageUrlResponse = await uploadImage(formData);
        if (!imageUrlResponse.success) {
            return {
                success: false,
                message: imageUrlResponse.message,
            }
        };
        const { title, description } = validatedFields.data;
        // Inside createCategory or updateCategory
        const specifications: { [key: string]: string } = {};

        // Use the spec_count sent by the form to loop accurately
        const specCount = parseInt(formData.get('spec_count') as string) || 0;

        for (let i = 0; i < specCount; i++) {
            const key = formData.get(`spec-key-${i}`)?.toString().trim();
            const value = formData.get(`spec-value-${i}`)?.toString().trim();

            // Only add to the object if the key is not empty
            if (key) {
                specifications[key] = value || ""; // Default to empty string if no value
            }
        }

        console.log("Processed Specifications:", specifications);
        await prisma.category.create({
            data: {
                title,
                status: 'active',
                description: description ?? '',
                img: imageUrlResponse.url || '',
                specifications
            }
        });

        revalidatePath('/admin/category');
        revalidatePath('/');
        return { success: true, message: "Category created successfully" };
    });

}

// 3. Get Category By ID
export async function getCategoryById(categoryId: string) {
    return withPermission('category_update', async () => {
        if (!categoryId) {
            return {
                success: false,
                message: "Category ID is required"
            }
        }
        const category = await prisma.category.findUnique({
            where: { id: Number(categoryId) }
        });

        if (!category) {
            return {
                success: false,
                message: "Category not found"
            }
        };
        return { success: true, category };
    });
}

// 4. Update Category
export async function updateCategory(categoryId: number | undefined, prevData: any, formData: FormData) {
    return await withPermission('category_update', async () => {
        if (!categoryId) throw new Error("Category ID is required");

        const rawData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
        }

        const validatedFields = CategorySchema.safeParse(rawData);

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

        let imageUrl = '';
        const imageFile = formData.get('image');
        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            const imageUrlResponse = await uploadImage(formData);
            if (!imageUrlResponse.success) {
                return {
                    success: false,
                    message: imageUrlResponse.message,
                }
            };
            imageUrl = imageUrlResponse.url || '';
        }
        const { title, description } = validatedFields.data;
        // Inside createCategory or updateCategory
        const specifications: { [key: string]: string } = {};

        // Use the spec_count sent by the form to loop accurately
        const specCount = parseInt(formData.get('spec_count') as string) || 0;

        for (let i = 0; i < specCount; i++) {
            const key = formData.get(`spec-key-${i}`)?.toString().trim();
            const value = formData.get(`spec-value-${i}`)?.toString().trim();

            // Only add to the object if the key is not empty
            if (key) {
                specifications[key] = value || ""; // Default to empty string if no value
            }
        }

        console.log("Processed Specifications:", specifications);

        const updateData: any = {
            title,
            description: description ?? '',
            status: 'active',
            specifications
        };

        if (imageUrl) updateData.img = imageUrl;

        await prisma.category.update({
            where: { id: categoryId },
            data: updateData
        });

        revalidatePath('/admin/category');
        revalidatePath('/');
        return { success: true, message: "Category updated successfully" };
    });
}

// 5. Delete Category
export async function deleteCategory(categoryId: string) {
    return withPermission('category_delete', async () => {
        if (!categoryId) {
            return {
                success: false,
                message: "Category ID is required"
            }
        }

        await prisma.category.delete({
            where: { id: Number(categoryId) }
        });

        revalidatePath('/admin/category');
        revalidatePath('/');
        return { success: true, message: "Category deleted successfully" };
    });
}