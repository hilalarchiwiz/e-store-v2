'use server'

import { PAGE_SIZE } from "@/lib/constant";
import prisma from "@/lib/prisma";
import { withPermission } from "@/lib/action-utils";
import { revalidatePath } from "next/cache";

// 1. Get All Newsletter Subscribers
export async function getSubscribers(searchParams: {
    search?: string,
    page?: string,
    limit?: string,
}) {
    return withPermission('subscriber_view', async () => {
        const query = searchParams.search || '';
        const currentPage = Number(searchParams.page) || 1;
        const itemsPerPage = Number(searchParams.limit) || PAGE_SIZE;
        const skip = (currentPage - 1) * itemsPerPage;

        const whereClause = query ? {
            email: {
                contains: query,
                mode: 'insensitive' as const
            }
        } : {};

        const [subscribers, totalCount] = await Promise.all([
            prisma.subscribe.findMany({
                where: whereClause,
                skip: skip,
                take: itemsPerPage,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.subscribe.count({ where: whereClause })
        ]);

        return {
            success: true,
            subscribers,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            totalCount: totalCount ?? 0
        };
    });
}

// 2. Delete/Unsubscribe a user
export async function deleteSubscribe(id: string) {
    return withPermission('subscriber_delete', async () => {
        if (!id) throw new Error("Subscriber ID is required");

        await prisma.subscribe.delete({
            where: {
                id: Number(id)
            }
        });

        revalidatePath('/admin/subscribers');

        return {
            success: true,
            message: 'Subscriber removed successfully'
        };
    });
}