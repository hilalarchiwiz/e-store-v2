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
    discountInput: string;
}

interface RecordPaymentInput {
    orderId: string;
    amount: number;
}

function parseInvoiceDiscount(value: string, amountBeforeDiscount: number) {
    const rawValue = value.trim();

    if (!rawValue) {
        return { discountInput: "0", discount: 0 };
    }

    const isPercentage = rawValue.endsWith("%");
    const numericText = (isPercentage ? rawValue.slice(0, -1) : rawValue)
        .replace(/,/g, "")
        .trim();
    const numericValue = Number(numericText);

    if (!Number.isFinite(numericValue) || numericValue < 0) {
        throw new Error("Enter a valid discount such as 5000 or 5%.");
    }

    if (isPercentage && numericValue > 100) {
        throw new Error("Percentage discount cannot be greater than 100%.");
    }

    const calculatedDiscount = isPercentage
        ? (amountBeforeDiscount * numericValue) / 100
        : numericValue;
    const discount = Math.round(calculatedDiscount * 100) / 100;

    if (discount > amountBeforeDiscount) {
        throw new Error("Discount cannot be greater than the invoice amount.");
    }

    return {
        discountInput: isPercentage ? `${numericValue}%` : String(numericValue),
        discount,
    };
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

        if (!input.orderId) {
            return { success: false, message: "Order ID is required." };
        }

        if (!Object.values(OrderStatus).includes(orderStatus)) {
            return { success: false, message: "Please select a valid order status." };
        }

        if (!Object.values(PaymentStatus).includes(paymentStatus)) {
            return { success: false, message: "Please select a valid payment status." };
        }

        const updatedOrder = await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: input.orderId },
                select: { subtotal: true, shippingFee: true, amountPaid: true },
            });

            if (!order) {
                throw new Error("Order not found.");
            }

            const amountBeforeDiscount = order.subtotal + order.shippingFee;
            const parsedDiscount = parseInvoiceDiscount(input.discountInput, order.subtotal);
            const discount = parsedDiscount.discount;
            const total = Math.round((amountBeforeDiscount - discount) * 100) / 100;

            if (order.amountPaid > total) {
                throw new Error("This discount would make the total lower than the amount already paid.");
            }

            const isFullyPaid = total === 0 || order.amountPaid >= total;

            if (paymentStatus === PaymentStatus.PAID && !isFullyPaid) {
                throw new Error("Record the full payment before marking this invoice as paid.");
            }

            return tx.order.update({
                where: { id: input.orderId },
                data: {
                    status: orderStatus,
                    paymentStatus: isFullyPaid ? PaymentStatus.PAID : paymentStatus,
                    discount,
                    discountInput: parsedDiscount.discountInput,
                    total,
                },
                select: {
                    id: true,
                    status: true,
                    paymentStatus: true,
                    discount: true,
                    discountInput: true,
                    amountPaid: true,
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

export async function recordOrderPayment(input: RecordPaymentInput) {
    return withPermission("order_status_manage", async () => {
        const requestedAmount = Number(input.amount);

        if (!input.orderId) {
            return { success: false, message: "Order ID is required." };
        }

        if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
            return { success: false, message: "Payment amount must be greater than zero." };
        }

        const amount = Math.round(requestedAmount * 100) / 100;

        const payment = await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: input.orderId },
                select: { total: true, amountPaid: true },
            });

            if (!order) {
                throw new Error("Order not found.");
            }

            const amountDue = Math.max(0, Math.round((order.total - order.amountPaid) * 100) / 100);

            if (amountDue === 0) {
                throw new Error("This invoice is already fully paid.");
            }

            if (amount > amountDue) {
                throw new Error(`Payment cannot be greater than the amount due (PKR ${amountDue.toFixed(2)}).`);
            }

            const amountPaid = Math.round((order.amountPaid + amount) * 100) / 100;
            const remainingDue = Math.max(0, Math.round((order.total - amountPaid) * 100) / 100);

            return tx.order.update({
                where: { id: input.orderId },
                data: {
                    amountPaid,
                    paymentStatus: remainingDue === 0 ? PaymentStatus.PAID : PaymentStatus.PENDING,
                },
                select: {
                    id: true,
                    amountPaid: true,
                    total: true,
                    paymentStatus: true,
                    updatedAt: true,
                },
            });
        });

        revalidatePath("/admin/orders");
        revalidatePath(`/admin/orders/${input.orderId}/invoice`);

        return {
            success: true,
            message: "Payment recorded successfully.",
            payment,
        };
    });
}
