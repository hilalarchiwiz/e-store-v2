'use server'
import { PAGE_SIZE } from "@/lib/constant";
import prisma from "@/lib/prisma";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { withPermission } from "@/lib/action-utils";

interface SaveInvoiceInput {
    orderId: string;
    status: string;
    paymentStatus: string;
    discount: number;
}

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

export async function saveInvoice(input: SaveInvoiceInput) {
    return withPermission("order_status_manage", async () => {
        const orderStatus = input.status as OrderStatus;
        const paymentStatus = input.paymentStatus as PaymentStatus;
        const requestedDiscount = Number(input.discount);

        if (!input.orderId) {
            return { success: false, message: "Order ID is required." };
        }

        if (!Object.values(OrderStatus).includes(orderStatus)) {
            return { success: false, message: "Please select a valid order status." };
        }

        if (!Object.values(PaymentStatus).includes(paymentStatus)) {
            return { success: false, message: "Please select a valid payment status." };
        }

        if (!Number.isFinite(requestedDiscount) || requestedDiscount < 0) {
            return { success: false, message: "Discount must be a positive amount." };
        }

        const discount = Math.round(requestedDiscount * 100) / 100;

        const updatedOrder = await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: input.orderId },
                select: { subtotal: true, shippingFee: true },
            });

            if (!order) {
                throw new Error("Order not found.");
            }

            const amountBeforeDiscount = order.subtotal + order.shippingFee;

            if (discount > amountBeforeDiscount) {
                throw new Error("Discount cannot be greater than the invoice amount.");
            }

            const total = Math.round((amountBeforeDiscount - discount) * 100) / 100;

            return tx.order.update({
                where: { id: input.orderId },
                data: {
                    status: orderStatus,
                    paymentStatus,
                    discount,
                    total,
                },
                select: {
                    id: true,
                    status: true,
                    paymentStatus: true,
                    discount: true,
                    total: true,
                    updatedAt: true,
                },
            });
        });

        revalidatePath("/admin/orders");
        revalidatePath(`/admin/orders/${input.orderId}/invoice`);

        return {
            success: true,
            message: "Invoice saved successfully.",
            invoice: updatedOrder,
        };
    });
}
