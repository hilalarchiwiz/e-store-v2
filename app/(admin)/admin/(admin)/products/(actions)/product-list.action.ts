'use server';

import { Prisma, ProductStatus } from '@prisma/client';
import { withPermission } from '@/lib/action-utils';
import { PAGE_SIZE } from '@/lib/constant';
import prisma from '@/lib/prisma';

type ProductListParam = string | string[] | undefined;

export interface ProductListSearchParams {
    search?: ProductListParam;
    page?: ProductListParam;
    limit?: ProductListParam;
    brand?: ProductListParam;
    category?: ProductListParam;
    grading?: ProductListParam;
    minPrice?: ProductListParam;
    maxPrice?: ProductListParam;
    status?: ProductListParam;
}

function getSingleParam(value: ProductListParam) {
    return Array.isArray(value) ? value[0] : value;
}

function getPositiveInteger(value: ProductListParam) {
    const parsed = Number(getSingleParam(value));
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function getNonNegativeNumber(value: ProductListParam) {
    const rawValue = getSingleParam(value);
    if (rawValue === undefined || rawValue.trim() === '') return undefined;

    const parsed = Number(rawValue);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export async function getAllProducts(searchParams: ProductListSearchParams) {
    return withPermission('product_view', async () => {
        const query = getSingleParam(searchParams.search)?.trim() || '';
        const currentPage = getPositiveInteger(searchParams.page) || 1;
        const requestedLimit = getPositiveInteger(searchParams.limit);
        const itemsPerPage = requestedLimit && [10, 25, 50, 100].includes(requestedLimit)
            ? requestedLimit
            : PAGE_SIZE;
        const skip = (currentPage - 1) * itemsPerPage;

        const where: Prisma.ProductWhereInput = {};

        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { brand: { title: { contains: query, mode: 'insensitive' } } },
                { category: { title: { contains: query, mode: 'insensitive' } } },
                { grading: { title: { contains: query, mode: 'insensitive' } } },
            ];
        }

        const brand = getSingleParam(searchParams.brand);
        const category = getSingleParam(searchParams.category);
        const grading = getSingleParam(searchParams.grading);
        const brandId = getPositiveInteger(brand);
        const categoryId = getPositiveInteger(category);
        const gradingId = getPositiveInteger(grading);

        if (brand === 'none') where.brandId = null;
        else if (brandId) where.brandId = brandId;

        if (category === 'none') where.categoryId = null;
        else if (categoryId) where.categoryId = categoryId;

        if (grading === 'none') where.gradingId = null;
        else if (gradingId) where.gradingId = gradingId;

        const status = getSingleParam(searchParams.status);
        if (status && Object.values(ProductStatus).includes(status as ProductStatus)) {
            where.status = status as ProductStatus;
        }

        const minPrice = getNonNegativeNumber(searchParams.minPrice);
        const maxPrice = getNonNegativeNumber(searchParams.maxPrice);
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {
                ...(minPrice !== undefined ? { gte: minPrice } : {}),
                ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
            };
        }

        const [products, totalCount] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: itemsPerPage,
                orderBy: { createdAt: 'desc' },
                include: { brand: true, category: true, grading: true },
            }),
            prisma.product.count({ where }),
        ]);

        return {
            success: true,
            products,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            totalCount,
            currentPage,
            itemsPerPage,
        };
    });
}

export async function getProductFilterOptions() {
    return withPermission('product_view', async () => {
        const [brands, categories, gradings, priceRange] = await Promise.all([
            prisma.brand.findMany({
                select: { id: true, title: true },
                orderBy: { title: 'asc' },
            }),
            prisma.category.findMany({
                select: { id: true, title: true },
                orderBy: { title: 'asc' },
            }),
            prisma.grading.findMany({
                select: { id: true, title: true },
                orderBy: { title: 'asc' },
            }),
            prisma.product.aggregate({
                _min: { price: true },
                _max: { price: true },
            }),
        ]);

        return {
            success: true,
            brands,
            categories,
            gradings,
            priceBounds: {
                min: priceRange._min.price ?? 0,
                max: priceRange._max.price ?? 0,
            },
        };
    });
}
