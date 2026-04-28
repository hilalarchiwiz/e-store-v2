'use server';

import { withPermission } from "@/lib/action-utils";
import { PAGE_SIZE } from "@/lib/constant";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { FaqSchema } from "../validation/faq.validation";

// 1. Get All FAQs
export async function getFaqs(searchParams: { search?: string; page?: string; limit?: string }) {
    return withPermission('faq_view', async () => {
        const query = searchParams.search || "";
        const currentPage = Number(searchParams.page) || 1;
        const itemsPerPage = Number(searchParams.limit) || PAGE_SIZE;
        const skip = (currentPage - 1) * itemsPerPage;

        const whereClause = query ? {
            OR: [
                { question: { contains: query, mode: "insensitive" as const } },
                { answer: { contains: query, mode: "insensitive" as const } },
            ],
        } : {};

        const [faqs, totalCount] = await Promise.all([
            prisma.faq.findMany({
                where: whereClause,
                skip: skip,
                take: itemsPerPage,
                orderBy: { createdAt: "desc" },
            }),
            prisma.faq.count({ where: whereClause }),
        ]);

        return {
            success: true,
            faqs,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            totalCount: totalCount ?? 0
        };
    });
}

// 2. Create FAQ
export async function createFaq(prevState: any, formData: FormData) {
    return withPermission('faq_create', async () => {
        const rawData = {
            question: formData.get('question'),
            answer: formData.get('answer'),
        };

        // Zod validation (throws if fails, caught by withPermission)
        const validatedData = FaqSchema.parse(rawData);

        await prisma.faq.create({
            data: validatedData,
        });

        revalidatePath('/admin/faq');
        return { success: true, message: "FAQ created successfully!" };
    });
}

// 3. Get FAQ By ID
export async function getFaqById(id: string | number) {
    return withPermission('faq_update', async () => {
        const faq = await prisma.faq.findUnique({
            where: { id: Number(id) },
        });

        if (!faq) throw new Error("FAQ not found.");

        return { success: true, faq };
    });
}

// 4. Update FAQ
export async function updateFaq(id: string | number | undefined, prevState: any, formData: FormData) {
    return withPermission('faq_update', async () => {
        if (!id) throw new Error("FAQ ID is required.");

        const rawData = {
            question: formData.get('question'),
            answer: formData.get('answer'),
        };

        const validatedData = FaqSchema.parse(rawData);

        await prisma.faq.update({
            where: { id: Number(id) },
            data: validatedData,
        });

        revalidatePath('/admin/faq');
        return { success: true, message: "FAQ updated successfully!" };
    });
}

// 5. Delete FAQ
export async function deleteFaq(id: string | number) {
    return withPermission('faq_delete', async () => {
        await prisma.faq.delete({
            where: { id: Number(id) },
        });

        revalidatePath('/admin/faq');
        return { success: true, message: "FAQ deleted successfully!" };
    });
}