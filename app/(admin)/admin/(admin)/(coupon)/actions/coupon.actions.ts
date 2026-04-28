'use server';

import { withPermission } from '@/lib/action-utils';
import { PAGE_SIZE } from '@/lib/constant';
import prisma from '@/lib/prisma';
import { DiscountType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { couponSchema } from '../validations/coupon';

// Helper to parse FormData for Coupons
const parseCouponData = (formData: FormData) => ({
    code: formData.get('code')?.toString().toUpperCase(),
    discountType: formData.get('discountType'),
    discountValue: Number(formData.get('discountValue')),
    minPurchase: formData.get('minPurchase') ? Number(formData.get('minPurchase')) : null,
    maxDiscount: formData.get('maxPurchase') ? Number(formData.get('maxPurchase')) : null,
    usageLimit: formData.get('usageLimit') ? Number(formData.get('usageLimit')) : null,
    isActive: formData.get('isActive') === 'true',
    expiresAt: formData.get('expiryDate') ? new Date(formData.get('expiryDate') as string) : null,
});

// 1. Get All Coupons
export async function getCoupons(searchParams: { search?: string; page?: string; limit?: string }) {
    return withPermission('coupon_view', async () => {
        const query = searchParams.search || "";
        const currentPage = Number(searchParams.page) || 1;
        const itemsPerPage = Number(searchParams.limit) || PAGE_SIZE;
        const skip = (currentPage - 1) * itemsPerPage;

        const whereClause = query ? {
            code: { contains: query, mode: 'insensitive' as const }
        } : {};

        const [coupons, totalCount] = await Promise.all([
            prisma.coupon.findMany({
                where: whereClause,
                skip,
                take: itemsPerPage,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.coupon.count({ where: whereClause }),
        ]);

        return {
            success: true,
            coupons,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            totalCount: totalCount ?? 0
        };
    });
}

// 2. Create Coupon
export async function createCoupon(prevData: any, formData: FormData) {
    return withPermission('coupon_create', async () => {
        const rawData = parseCouponData(formData);
        const validatedData = couponSchema.parse(rawData);

        const existing = await prisma.coupon.findUnique({ where: { code: validatedData.code } });
        if (existing) throw new Error('Coupon code already exists');

        await prisma.coupon.create({
            data: {
                code: validatedData.code,
                discount: rawData.discountValue,
                discountType: validatedData.discountType as DiscountType,
                minPurchase: validatedData.minPurchase,
                maxDiscount: validatedData.maxDiscount,
                usageLimit: validatedData.usageLimit,
                isActive: validatedData.isActive,
                expiresAt: validatedData.expiresAt,
            },
        });

        revalidatePath('/admin/coupon');
        return { success: true, message: 'Coupon created successfully' };
    });
}

// 3. Update Coupon
export async function updateCoupon(id: string, prevData: any, formData: FormData) {
    return withPermission('coupon_update', async () => {
        const rawData = parseCouponData(formData);
        const validatedData = couponSchema.parse(rawData);

        const existing = await prisma.coupon.findUnique({ where: { id } });
        if (!existing) throw new Error('Coupon not found');

        // Duplicate code check
        if (validatedData.code !== existing.code) {
            const duplicate = await prisma.coupon.findUnique({ where: { code: validatedData.code } });
            if (duplicate) throw new Error('Coupon code already exists');
        }

        await prisma.coupon.update({
            where: { id },
            data: {
                code: validatedData.code,
                discount: validatedData.discountValue,
                discountType: validatedData.discountType,
                minPurchase: validatedData.minPurchase,
                maxDiscount: validatedData.maxDiscount,
                usageLimit: validatedData.usageLimit,
                isActive: validatedData.isActive,
                expiresAt: validatedData.expiresAt,
            },
        });

        revalidatePath('/admin/coupon');
        return { success: true, message: 'Coupon updated successfully' };
    });
}

// 4. Delete Coupon
export async function deleteCoupon(id: string) {
    return withPermission('coupon_delete', async () => {
        await prisma.coupon.delete({ where: { id } });
        revalidatePath('/admin/coupon');
        return { success: true, message: 'Coupon deleted successfully' };
    });
}

// Get Single Coupon by ID
export async function getCouponById(id: string) {
    return withPermission('coupon_update', async () => {
        if (!id) throw new Error("Coupon ID is required");

        const coupon = await prisma.coupon.findUnique({
            where: { id },
        });

        if (!coupon) {
            throw new Error('Coupon not found');
        }

        return {
            success: true,
            coupon: coupon,
        };
    });
}

// 5. Toggle Status
export async function toggleCouponStatus(id: string) {
    return withPermission('coupon_update', async () => {
        const coupon = await prisma.coupon.findUnique({ where: { id } });
        if (!coupon) throw new Error('Coupon not found');

        await prisma.coupon.update({
            where: { id },
            data: { isActive: !coupon.isActive },
        });

        revalidatePath('/admin/coupon');
        return { success: true, message: 'Status updated' };
    });
}

// 6. Public Method: Apply Coupon (No permission wrapper needed as this is for customers)
export async function applyCoupon(code: string, orderTotal: number) {
    try {
        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!coupon || !coupon.isActive) throw new Error('Invalid or inactive coupon');
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) throw new Error('Coupon expired');
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) throw new Error('Usage limit reached');
        if (coupon.minPurchase && orderTotal < coupon.minPurchase) throw new Error(`Min purchase $${coupon.minPurchase} required`);

        let discountAmount = coupon.discountType === 'PERCENTAGE'
            ? (orderTotal * coupon.discount) / 100
            : coupon.discount;

        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount;
        discountAmount = Math.min(discountAmount, orderTotal);

        return {
            success: true,
            data: {
                discountAmount,
                finalTotal: orderTotal - discountAmount,
                code: coupon.code
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}