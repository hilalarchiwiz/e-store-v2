'use server'

import { uploadImage } from "@/lib/action/FileUpload";
import { PAGE_SIZE } from "@/lib/constant";
import { slugify } from "@/lib/helper";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { withPermission } from "@/lib/action-utils";

// ===================== GET =====================

export async function getBlogs(searchParams: { search?: string; page?: string; limit?: string }) {
    return withPermission("blog_view", async () => {

        const query = searchParams.search || "";
        const currentPage = Number(searchParams.page) || 1;
        const itemsPerPage = Number(searchParams.limit) || PAGE_SIZE;
        const skip = (currentPage - 1) * itemsPerPage;

        const where = query
            ? {
                OR: [
                    { title: { contains: query, mode: 'insensitive' as const } },
                    { description: { contains: query, mode: 'insensitive' as const } },
                    { content: { contains: query, mode: 'insensitive' as const } },
                ]
            }
            : {};

        const [blogs, totalCount] = await Promise.all([
            prisma.blog.findMany({ where, skip, take: itemsPerPage, orderBy: { createdAt: 'desc' } }),
            prisma.blog.count({ where })
        ]);

        return {
            success: true,
            blogs,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            totalCount
        };
    });
}

// ===================== CREATE =====================

export async function createBlog(_: any, formData: FormData) {
    return withPermission("blog_create", async () => {

        const title = String(formData.get('title') || '');
        const description = String(formData.get('description') || '');
        const content = String(formData.get('content') || '');
        const tag = String(formData.get('tag') || '');

        let imageUrl = '';
        const imageFile = formData.get('image');

        if (imageFile instanceof File && imageFile.size > 0) {
            const upload = await uploadImage(formData);
            if (!upload.success) return { success: false, message: `Image upload failed: ${upload.message}` };
            imageUrl = upload.url || '';
        }

        await prisma.blog.create({
            data: {
                title,
                tag,
                description,
                content,
                slug: slugify(title),
                image: imageUrl
            }
        });

        revalidatePath('/admin/blog');
        revalidatePath('/blog');

        return { success: true, message: 'Blog created successfully' };
    });
}

// ===================== GET SINGLE =====================

export async function getBlog(id: string) {
    return withPermission("blog_update", async () => {
        const blog = await prisma.blog.findUnique({ where: { id: Number(id) } });
        return { success: true, blog };
    });
}

// ===================== UPDATE =====================

export async function updateBlog(id: string, _: any, formData: FormData) {
    return withPermission("blog_update", async () => {

        const title = String(formData.get('title') || '');
        const description = String(formData.get('description') || '');
        const content = String(formData.get('content') || '');
        const tag = String(formData.get('tag') || '');

        let imageUrl: string | undefined;
        const imageFile = formData.get('image');

        if (imageFile instanceof File && imageFile.size > 0) {
            const upload = await uploadImage(formData);
            if (!upload.success) return { success: false, message: `Image upload failed: ${upload.message}` };
            imageUrl = upload.url;
        }

        await prisma.blog.update({
            where: { id: Number(id) },
            data: {
                title,
                tag,
                description,
                content,
                slug: slugify(title),
                ...(imageUrl && { image: imageUrl })
            }
        });

        revalidatePath('/admin/blog');
        revalidatePath('/blog');

        return { success: true, message: 'Blog updated successfully' };
    });
}

// ===================== DELETE =====================

export async function deleteBlog(id: string) {
    return withPermission("blog_update", async () => {
        await prisma.blog.delete({ where: { id: Number(id) } });

        revalidatePath('/admin/blog');
        revalidatePath('/blog');

        return { success: true, message: 'Blog deleted successfully' };
    });
}
