'use server'

import { z } from 'zod'
import { withPermission } from "@/lib/action-utils"
import { uploadImage } from '@/lib/action/FileUpload'
import { PAGE_SIZE } from '@/lib/constant'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const SubCategorySchema = z.object({
    title: z.string().nonempty({ message: "Title is required" }).min(2, "Title must be at least 2 characters").max(100),
    description: z.string().max(500).optional().or(z.literal('')),
})

// 1. Get All SubCategories
export async function getSubCategories(searchParams: { search?: string; page?: string; limit?: string; categoryId?: string }) {
    return withPermission('category_view', async () => {
        const query = searchParams.search || ""
        const currentPage = Number(searchParams.page) || 1
        const itemsPerPage = Number(searchParams.limit) || PAGE_SIZE
        const skip = (currentPage - 1) * itemsPerPage

        const whereClause: any = {}
        if (searchParams.categoryId) whereClause.categoryId = Number(searchParams.categoryId)
        if (query) {
            whereClause.OR = [
                { title: { contains: query, mode: 'insensitive' as const } },
                { description: { contains: query, mode: 'insensitive' as const } },
            ]
        }

        const [subCategories, totalCount] = await Promise.all([
            prisma.subCategory.findMany({
                where: whereClause,
                include: { category: { select: { id: true, title: true } } },
                skip,
                take: itemsPerPage,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.subCategory.count({ where: whereClause }),
        ])

        return {
            success: true,
            subCategories,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            totalCount: totalCount ?? 0,
        }
    })
}

// 2. Create SubCategory
export async function createSubCategory(prevData: any, formData: FormData) {
    return withPermission('category_create', async () => {
        const rawData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
        }
        const validated = SubCategorySchema.safeParse(rawData)
        if (!validated.success) {
            const errors = validated.error.flatten().fieldErrors as Record<string, string[]>
            const firstKey = Object.keys(errors)[0]
            return { success: false, errors, message: errors[firstKey][0] }
        }

        const categoryId = Number(formData.get('categoryId'))
        if (!categoryId) return { success: false, message: 'Parent category is required' }

        let imgUrl = ''
        const imageFile = formData.get('image')
        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            const imageUrlResponse = await uploadImage(formData)
            if (!imageUrlResponse.success) return { success: false, message: imageUrlResponse.message }
            imgUrl = imageUrlResponse.url || ''
        }

        await prisma.subCategory.create({
            data: {
                title: validated.data.title,
                description: validated.data.description ?? '',
                img: imgUrl,
                status: 'active',
                categoryId,
            },
        })

        revalidatePath('/admin/subcategory')
        revalidatePath('/')
        return { success: true, message: 'Sub-category created successfully' }
    })
}

// 3. Get SubCategory By ID
export async function getSubCategoryById(id: string) {
    return withPermission('category_update', async () => {
        if (!id) return { success: false, message: 'SubCategory ID is required' }
        const subCategory = await prisma.subCategory.findUnique({
            where: { id: Number(id) },
            include: { category: { select: { id: true, title: true } } },
        })
        if (!subCategory) return { success: false, message: 'SubCategory not found' }
        return { success: true, subCategory }
    })
}

// 4. Update SubCategory
export async function updateSubCategory(subCategoryId: number | undefined, prevData: any, formData: FormData) {
    return withPermission('category_update', async () => {
        if (!subCategoryId) throw new Error('SubCategory ID is required')

        const rawData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
        }
        const validated = SubCategorySchema.safeParse(rawData)
        if (!validated.success) {
            const errors = validated.error.flatten().fieldErrors as Record<string, string[]>
            const firstKey = Object.keys(errors)[0]
            return { success: false, errors, message: errors[firstKey][0] }
        }

        const categoryId = Number(formData.get('categoryId'))
        if (!categoryId) return { success: false, message: 'Parent category is required' }

        let imageUrl = ''
        const imageFile = formData.get('image')
        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            const imageUrlResponse = await uploadImage(formData)
            if (!imageUrlResponse.success) return { success: false, message: imageUrlResponse.message }
            imageUrl = imageUrlResponse.url || ''
        }

        const updateData: any = {
            title: validated.data.title,
            description: validated.data.description ?? '',
            status: 'active',
            categoryId,
        }
        if (imageUrl) updateData.img = imageUrl

        await prisma.subCategory.update({ where: { id: subCategoryId }, data: updateData })

        revalidatePath('/admin/subcategory')
        revalidatePath('/')
        return { success: true, message: 'Sub-category updated successfully' }
    })
}

// 5. Delete SubCategory
export async function deleteSubCategory(id: string) {
    return withPermission('category_delete', async () => {
        if (!id) return { success: false, message: 'SubCategory ID is required' }
        await prisma.subCategory.delete({ where: { id: Number(id) } })
        revalidatePath('/admin/subcategory')
        revalidatePath('/')
        return { success: true, message: 'Sub-category deleted successfully' }
    })
}

// 6. Get All Categories (for select dropdown in forms)
export async function getAllCategoriesForSelect() {
    const categories = await prisma.category.findMany({
        where: { status: 'active' },
        select: { id: true, title: true },
        orderBy: { title: 'asc' },
    })
    return categories
}
