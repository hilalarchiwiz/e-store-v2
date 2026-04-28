'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PageSchema } from "../validation/page.validation";
import { PAGE_SIZE } from "@/lib/constant";
import { slugify } from "@/lib/helper";
import { Prisma } from "@prisma/client";
import { withPermission } from "@/lib/action-utils";

// 1. Get All Pages
export async function getPages(searchParams: { search?: string; page?: string; limit?: string }) {
    return withPermission('page_view', async () => {
        const query = searchParams.search || "";
        const currentPage = Number(searchParams.page) || 1;
        const itemsPerPage = Number(searchParams.limit) || PAGE_SIZE;
        const skip = (currentPage - 1) * itemsPerPage;

        const whereClause: Prisma.PageWhereInput = query ? {
            OR: [
                { title: { contains: query, mode: "insensitive" as const } },
                { content: { contains: query, mode: "insensitive" as const } },
            ],
        } : {};

        const [pages, totalCount] = await Promise.all([
            prisma.page.findMany({
                where: whereClause,
                skip: skip,
                take: itemsPerPage,
                orderBy: { createdAt: "desc" },
            }),
            prisma.page.count({ where: whereClause }),
        ]);

        return {
            success: true,
            pages,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            totalCount: totalCount ?? 0
        };
    });
}

// 2. Create Page
export async function createPage(prevState: any, formData: FormData) {
    return withPermission('page_create', async () => {
        const rawData = {
            title: formData.get('title'),
            content: formData.get('content'),
        };

        // Validate (throws ZodError if fails)
        const validatedData = PageSchema.parse(rawData);
        const generatedSlug = slugify(validatedData.title);

        try {
            await prisma.page.create({
                data: {
                    ...validatedData,
                    slug: generatedSlug,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new Error("A page with this title/slug already exists.");
            }
            throw error;
        }

        revalidatePath('/admin/page');
        return { success: true, message: "Page created successfully!" };
    });
}

// 3. Get Page By ID
export async function getPageById(id: string | number) {
    return withPermission('page_update', async () => {
        const page = await prisma.page.findUnique({
            where: { id: Number(id) },
        });

        if (!page) throw new Error("Page not found.");

        return { success: true, page };
    });
}

// 4. Update Page
export async function updatePage(id: string | number | undefined, prevState: any, formData: FormData) {
    return withPermission('page_update', async () => {
        if (!id) throw new Error("ID is required for updates.");

        const rawData = {
            title: formData.get('title'),
            content: formData.get('content'),
        };

        const validatedData = PageSchema.parse(rawData);
        const generatedSlug = slugify(validatedData.title);

        try {
            await prisma.page.update({
                where: { id: Number(id) },
                data: {
                    ...validatedData,
                    slug: generatedSlug,
                },
            });
        } catch (error) {
            // P2002 is Unique constraint failed
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new Error("Another page already uses this title/slug.");
            }
            throw error;
        }

        revalidatePath('/admin/page');
        return { success: true, message: "Page updated successfully!" };
    });
}

// 5. Delete Page
export async function deletePage(id: string | number) {
    return withPermission('page_delete', async () => {
        await prisma.page.delete({
            where: { id: Number(id) },
        });

        revalidatePath('/admin/page');
        return { success: true, message: "Page deleted successfully!" };
    });
}