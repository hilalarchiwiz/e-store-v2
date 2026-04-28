'use server'
import { PAGE_SIZE } from "@/lib/constant";
import prisma from "@/lib/prisma";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getOrders(searchParams: { search?: string; page?: string; limit?: string }) {
    try {
        const query = searchParams.search || "";
        const currentPage = Number(searchParams.page) || 1;
        const itemsPerPage = Number(searchParams.limit) || PAGE_SIZE;
        const skip = (currentPage - 1) * itemsPerPage;
        // 1. Build the WHERE clause for searching
        const whereClause: Prisma.OrderWhereInput = query ? {
            OR: [
                { orderNumber: { contains: query, mode: 'insensitive' } },
                {
                    // Search within the order items' products
                    orderItems: {
                        some: {
                            product: {
                                OR: [
                                    { title: { contains: query, mode: 'insensitive' } },
                                    { description: { contains: query, mode: 'insensitive' } },
                                    { brand: { title: { contains: query, mode: 'insensitive' } } },
                                    { category: { title: { contains: query, mode: 'insensitive' } } },
                                ]
                            }
                        }
                    }
                },
                {
                    // Search by customer info
                    billingAddress: {
                        OR: [
                            { firstName: { contains: query, mode: 'insensitive' } },
                            { lastName: { contains: query, mode: 'insensitive' } },
                            { email: { contains: query, mode: 'insensitive' } },
                        ]
                    }
                }
            ]
        } : {};

        const [orders, totalCount] = await Promise.all([
            prisma.order.findMany({
                where: whereClause,
                skip: skip,
                take: itemsPerPage,
                include: {
                    orderItems: { include: { product: true } },
                    user: true,
                    billingAddress: true,
                    shippingAddress: true,
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.order.count({ where: whereClause })
        ]);

        return {
            success: true,
            orders,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            totalCount: totalCount ?? 0
        };
    } catch (error) {
        const err = error as Error;
        return { success: false, error: err.message };
    }
}


export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    await prisma.order.update({
        where: { id: orderId },
        data: { status }
    });
    revalidatePath("/admin/orders");
}

export async function updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
    await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus }
    });

    revalidatePath("/admin/orders");
}