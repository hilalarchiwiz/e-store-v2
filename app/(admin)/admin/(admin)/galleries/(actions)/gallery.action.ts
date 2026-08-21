'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { withPermission } from '@/lib/action-utils';
import { PAGE_SIZE } from '@/lib/constant';
import prisma from '@/lib/prisma';
import { replaceManagedProductImage } from '@/lib/azure-product-images';

type GalleryParam = string | string[] | undefined;

export interface GallerySearchParams {
    search?: GalleryParam;
    page?: GalleryParam;
    limit?: GalleryParam;
}

const getSingleParam = (value: GalleryParam) => Array.isArray(value) ? value[0] : value;

const getPositiveInteger = (value: GalleryParam) => {
    const parsedValue = Number(getSingleParam(value));
    return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : undefined;
};

export async function getGalleryProducts(searchParams: GallerySearchParams) {
    return withPermission('product_view', async () => {
        const search = getSingleParam(searchParams.search)?.trim() || '';
        const currentPage = getPositiveInteger(searchParams.page) || 1;
        const requestedLimit = getPositiveInteger(searchParams.limit);
        const itemsPerPage = requestedLimit && [10, 25, 50, 100].includes(requestedLimit)
            ? requestedLimit
            : PAGE_SIZE;
        const where = search
            ? { title: { contains: search, mode: 'insensitive' as const } }
            : {};

        const [products, totalCount] = await Promise.all([
            prisma.product.findMany({
                where,
                skip: (currentPage - 1) * itemsPerPage,
                take: itemsPerPage,
                orderBy: { title: 'asc' },
                select: {
                    id: true,
                    title: true,
                    images: true,
                },
            }),
            prisma.product.count({ where }),
        ]);

        return {
            success: true,
            products,
            totalCount,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            currentPage,
            itemsPerPage,
        };
    });
}

export async function replaceGalleryImageBackground(formData: FormData) {
    return withPermission('product_update', async () => {
        const productId = Number(formData.get('productId'));
        const imageUrl = formData.get('imageUrl');
        const imageFile = formData.get('image');

        if (!Number.isInteger(productId) || productId <= 0) {
            throw new Error('A valid product is required.');
        }

        if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
            throw new Error('A valid product image is required.');
        }

        if (!(imageFile instanceof File) || imageFile.size === 0) {
            throw new Error('The processed image is missing.');
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, images: true },
        });

        if (!product || !product.images.includes(imageUrl)) {
            throw new Error('This image does not belong to the selected product.');
        }

        await replaceManagedProductImage(imageUrl, imageFile);

        // The product and its image URL stay unchanged. Only the bytes in the
        // existing Azure blob are replaced.
        revalidatePath('/admin/galleries');
        revalidatePath('/admin/products');
        revalidatePath('/shop');
        revalidatePath(`/product/${productId}`);
        updateTag('products');

        return {
            success: true,
            message: 'Background cleared. The same Azure image was replaced.',
            imageUrl,
            version: Date.now(),
        };
    });
}
