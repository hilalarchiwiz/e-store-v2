import { z } from 'zod';

export const couponSchema = z.object({
    code: z.string()
        .min(3, 'Code must be at least 3 characters')
        .max(50, 'Code must not exceed 50 characters')
        .regex(/^[A-Z0-9_-]+$/, 'Code must contain only uppercase letters, numbers, hyphens, and underscores'),
    discountValue: z.number()
        .positive('Discount must be positive')
        .refine((val) => val > 0, 'Discount must be greater than 0'),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
    minPurchase: z.number().positive().optional().nullable(),
    maxDiscount: z.number().positive().optional().nullable(),
    usageLimit: z.number().int().positive().optional().nullable(),
    isActive: z.boolean().default(true),
    expiresAt: z.date().optional().nullable(),
}).refine((data) => {
    if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
        return false;
    }
    return true;
}, {
    message: 'Percentage discount cannot exceed 100%',
    path: ['discountValue'],
}).refine((data) => {
    if (data.expiresAt && data.expiresAt < new Date()) {
        return false;
    }
    return true;
}, {
    message: 'Expiration date must be in the future',
    path: ['expiresAt'],
});

export type CouponInput = z.infer<typeof couponSchema>;