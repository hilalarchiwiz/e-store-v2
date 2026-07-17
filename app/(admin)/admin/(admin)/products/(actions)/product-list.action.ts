'use server';

import { Prisma, ProductStatus } from '@prisma/client';
import { withPermission } from '@/lib/action-utils';
import { PAGE_SIZE } from '@/lib/constant';
import prisma from '@/lib/prisma';
import { revalidatePath, updateTag } from 'next/cache';

type ProductListParam = string | string[] | undefined;

interface ErpTitleMatchProduct {
    id?: number | string;
    unique_id?: number | string | null;
    title?: string;
    status?: string | null;
    category?: string | null;
    warehouse_location?: string | null;
    disposition?: string | null;
    workflow_stage?: string | null;
    sold?: boolean;
    scrapped?: boolean;
    manual_product?: boolean;
    units?: number | string;
}

interface ErpTitleMatchResponse {
    success?: boolean;
    message?: string;
    query?: string;
    word_count?: number;
    count?: number;
    products?: ErpTitleMatchProduct[];
}

const ERP_API_BASE_URL = (process.env.ERP_API_BASE_URL || 'https://erp.archiwiz.com')
    .trim()
    .replace(/\/$/, '');

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

export async function searchErpProductsByTitle(title: string) {
    return withPermission('product_update', async () => {
        const normalizedTitle = title.trim();
        const wordCount = normalizedTitle.match(/[\p{L}\p{N}]+/gu)?.length ?? 0;

        if (wordCount < 3) {
            return {
                success: false,
                message: 'Please provide at least 3 words in the product title.',
                minimumWords: 3,
                wordCount,
                products: [],
            };
        }

        const response = await fetch(
            `${ERP_API_BASE_URL}/api/products/count3?title=${encodeURIComponent(normalizedTitle)}`,
            {
                method: 'GET',
                headers: { Accept: 'application/json' },
                cache: 'no-store',
                signal: AbortSignal.timeout(12_000),
            },
        );

        const data = await response.json().catch(() => null) as ErpTitleMatchResponse | null;
        if (!response.ok || !data?.success) {
            return {
                success: false,
                message: data?.message || 'Unable to search ERP products right now.',
                minimumWords: 3,
                wordCount: data?.word_count ?? wordCount,
                products: [],
            };
        }

        const products = Array.isArray(data.products)
            ? data.products
                .filter((item): item is ErpTitleMatchProduct & { title: string } => (
                    typeof item?.title === 'string' && item.title.trim().length > 0
                ))
                .map((item, index) => {
                    const parsedUnits = Number(item.units);
                    return {
                        id: String(item.id ?? item.unique_id ?? index),
                        uniqueId: item.unique_id === null || item.unique_id === undefined
                            ? null
                            : String(item.unique_id),
                        title: item.title.trim(),
                        status: item.status || null,
                        category: item.category || null,
                        warehouseLocation: item.warehouse_location || null,
                        disposition: item.disposition || null,
                        workflowStage: item.workflow_stage || null,
                        sold: Boolean(item.sold),
                        scrapped: Boolean(item.scrapped),
                        manualProduct: Boolean(item.manual_product),
                        units: Number.isFinite(parsedUnits) && parsedUnits >= 0
                            ? Math.floor(parsedUnits)
                            : 0,
                    };
                })
            : [];

        return {
            success: true,
            query: data.query || normalizedTitle,
            wordCount: data.word_count ?? wordCount,
            count: products.length,
            products,
        };
    });
}

export async function updateProductTitleAndQuantity(
    productId: number,
    title: string,
    quantity: number,
) {
    return withPermission('product_update', async () => {
        if (!Number.isInteger(productId) || productId <= 0) {
            throw new Error('A valid product is required.');
        }

        const normalizedTitle = title.trim();
        if (normalizedTitle.length < 5) {
            throw new Error('Title must contain at least 5 characters.');
        }

        if (normalizedTitle.length > 200) {
            throw new Error('Title cannot exceed 200 characters.');
        }

        if (!Number.isInteger(quantity) || quantity < 0) {
            throw new Error('Quantity must be a whole number greater than or equal to zero.');
        }

        const product = await prisma.product.update({
            where: { id: productId },
            data: {
                title: normalizedTitle,
                quantity,
            },
            select: {
                id: true,
                title: true,
                quantity: true,
            },
        });

        revalidatePath('/admin/products');
        revalidatePath(`/product/${productId}`);
        updateTag('products');

        return {
            success: true,
            message: 'Product title and quantity updated successfully.',
            product,
        };
    });
}
