'use server'

import { PAGE_SIZE } from "@/lib/constant";
import prisma from "@/lib/prisma";
import { withPermission } from "@/lib/action-utils";
import { revalidatePath } from "next/cache";

// 1. Get All Contact Submissions
export async function getContacts(searchParams: {
    search?: string,
    page?: string,
    limit?: string,
}) {
    return withPermission('contact_view', async () => {
        const query = searchParams.search || '';
        const currentPage = Number(searchParams.page) || 1;
        const itemsPerPage = Number(searchParams.limit) || PAGE_SIZE;
        const skip = (currentPage - 1) * itemsPerPage;

        const whereClause = query ? {
            OR: [
                { email: { contains: query, mode: 'insensitive' as const } },
                { name: { contains: query, mode: 'insensitive' as const } } // Added name search for utility
            ]
        } : {};

        const [contacts, totalCount] = await Promise.all([
            prisma.contact.findMany({
                where: whereClause,
                skip: skip,
                take: itemsPerPage,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.contact.count({ where: whereClause })
        ]);

        return {
            success: true,
            contacts,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            totalCount: totalCount ?? 0
        };
    });
}

// 2. Delete a Contact Message
export async function deleteContact(id: string) {
    return withPermission('contact_delete', async () => {
        if (!id) throw new Error("Contact ID is required");

        await prisma.contact.delete({
            where: {
                id: Number(id)
            }
        });

        revalidatePath('/admin/contact');
        return {
            success: true,
            message: 'Contact deleted successfully'
        };
    });
}