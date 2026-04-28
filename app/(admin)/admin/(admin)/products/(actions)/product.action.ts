'use server';

import { deleteMultipleImages } from "@/lib/action/FileUpload";
import { PAGE_SIZE } from "@/lib/constant";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { withPermission } from "@/lib/action-utils";
import { ProductSchema } from "../validations/product";

// --- Types & Helpers ---

interface ProductUpdateData {
    title: string;
    titleFont: string;
    description: string;
    warranty: string;
    price: number;
    discountedPrice?: number;
    brandId: number;
    quantity: number;
    categoryId: number;
    subCategoryId?: number | null;
    status: string;
    images: string[];
    specifications: { [key: string]: string };
    additionalInfo: string;
}

function extractAndValidateProductData(formData: FormData): ProductUpdateData {
    const title = formData.get('title') as string;
    const titleFont = formData.get('titleFont') as string;
    const description = formData.get('description') as string;
    const warranty = formData.get('warranty') as string;
    const priceString = formData.get('price') as string;
    const quantity = formData.get('quantity') as string;
    const discountedPriceString = formData.get('discount_price') as string | null;
    const brandIdString = formData.get('brand_id') as string;
    const categoryIdString = formData.get('category_id') as string;
    const subCategoryIdString = formData.get('subcategory_id') as string;
    const status = formData.get('status') as string;
    const additionalInfo = formData.get('additional_information') as string;
    const imageUrls = formData.getAll('images') as string[];

    if (!title || !description || !priceString || !brandIdString || !categoryIdString || !warranty) {
        throw new Error('Missing required fields.');
    }

    const specifications: { [key: string]: string } = {};
    for (const [key, value] of formData.entries()) {
        if (key.startsWith('spec-key-') && value) {
            const index = key.replace('spec-key-', '');
            const specValue = formData.get(`spec-value-${index}`) as string;
            if (specValue) {
                specifications[value.toString()] = specValue;
            }
        }
    }

    return {
        title, description, warranty,
        price: Number(priceString),
        discountedPrice: discountedPriceString ? Number(discountedPriceString) : undefined,
        brandId: parseInt(brandIdString),
        categoryId: parseInt(categoryIdString),
        subCategoryId: subCategoryIdString ? parseInt(subCategoryIdString) : null,
        quantity: Number(quantity),
        status: status || 'active',
        images: imageUrls,
        specifications,
        additionalInfo,
        titleFont
    };
}

// Helper to parse dynamic specs from FormData before Zod validation
function getRawData(formData: FormData) {
    const raw: any = Object.fromEntries(formData.entries());
    raw.images = formData.getAll('images');
    const specifications: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
        if (key.startsWith('spec-key-') && value) {
            const index = key.replace('spec-key-', '');
            const specValue = formData.get(`spec-value-${index}`);
            if (specValue) specifications[value.toString()] = specValue.toString();
        }
    }
    raw.specifications = specifications;
    return raw;
}

// --- Actions ---

export async function getCategoriesBySearch({ searchTerm = '', skip = 0, take = 50 }) {
    return withPermission('product_view', async () => {
        const categories = await prisma.category.findMany({
            where: {
                status: 'active',
                title: { contains: searchTerm, mode: 'insensitive' }
            },
            orderBy: { title: 'asc' },
            skip,
            take: take + 1,
        });

        const hasMore = categories.length > take;
        return {
            success: true,
            categories: categories.slice(0, take),
            hasMore
        };
    });
}

export async function getSubCategoriesByCategoryId(categoryId: number) {
    return withPermission('product_view', async () => {
        const subCategories = await prisma.subCategory.findMany({
            where: { categoryId, status: 'active' },
            select: { id: true, title: true },
            orderBy: { title: 'asc' },
        });
        return { success: true, subCategories };
    });
}

export async function getBrandsBySearch({ searchTerm = '', skip = 0, take = 50 }) {
    return withPermission('product_view', async () => {
        const brands = await prisma.brand.findMany({
            where: {
                status: 'active',
                title: { contains: searchTerm, mode: 'insensitive' }
            },
            orderBy: { title: 'asc' },
            skip,
            take: take + 1,
        });

        const hasMore = brands.length > take;
        return {
            success: true,
            brands: brands.slice(0, take),
            hasMore
        };
    });
}

export async function getAllProducts(searchParams: { search?: string; page?: string; limit?: string }) {
    return withPermission('product_view', async () => {
        const query = searchParams.search || "";
        const currentPage = Number(searchParams.page) || 1;
        const itemsPerPage = Number(searchParams.limit) || PAGE_SIZE;
        const skip = (currentPage - 1) * itemsPerPage;

        const whereClause = query ? {
            OR: [
                { title: { contains: query, mode: 'insensitive' as const } },
                { description: { contains: query, mode: 'insensitive' as const } },
                { brand: { title: { contains: query, mode: 'insensitive' as const } } },
                { category: { title: { contains: query, mode: 'insensitive' as const } } },
            ]
        } : {};

        const [products, totalCount] = await Promise.all([
            prisma.product.findMany({
                where: whereClause,
                skip,
                take: itemsPerPage,
                orderBy: { createdAt: 'desc' },
                include: { brand: true, category: true }
            }),
            prisma.product.count({ where: whereClause })
        ]);

        return {
            success: true,
            products,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            totalCount
        };
    });
}

export async function createProduct(prevData: any, formData: FormData) {
    // Permission check inside the logic
    return await withPermission('product_create', async () => {
        const validatedFields = ProductSchema.safeParse(getRawData(formData));
        const productId = formData.get('productId');
        if (!validatedFields.success) {
            const errors = validatedFields.error.flatten().fieldErrors;
            const firstErrorField = Object.keys(errors)[0];
            const firstErrorMessage = errors[firstErrorField][0];
            return {
                success: false,
                errors,
                message: firstErrorMessage,
            };
        }
        const data = extractAndValidateProductData(formData);
        let product;
        if (productId) {
            product = await prisma.product.update({
                where: { id: Number(productId) },
                data: {
                    ...data,
                    status: 'active'
                }
            })
        } else {
            product = await prisma.product.create({
                data: {
                    ...data
                }
            });
        }
        revalidatePath('/admin/products');
        revalidatePath('/shop');
        revalidatePath('/');
        return { success: true, id: product.id };
    });
}

export async function updateProduct(productId: number | undefined, prevData: any, formData: FormData) {
    if (!productId) return { success: false, message: "Product ID is required" };

    return await withPermission('product_update', async () => {
        const validatedFields = ProductSchema.safeParse(getRawData(formData));
        if (!validatedFields.success) {
            const errors = validatedFields.error.flatten().fieldErrors;
            const firstErrorField = Object.keys(errors)[0];
            const firstErrorMessage = errors[firstErrorField][0];
            return {
                success: false,
                errors,
                message: firstErrorMessage,
            };
        }
        const oldProduct = await prisma.product.findUnique({
            where: { id: productId },
            select: { images: true, id: true }
        });

        const data = extractAndValidateProductData(formData);

        await prisma.product.update({
            where: { id: productId },
            data: {
                ...data,
                status: 'active'
            }
        });

        // Image Cleanup
        const imagesToDelete = (oldProduct?.images || []).filter(url => !data.images.includes(url));
        if (imagesToDelete.length > 0) {
            await deleteMultipleImages(imagesToDelete);
        }

        revalidatePath('/admin/products');
        revalidatePath(`/shop-details/${oldProduct?.id}`);
        revalidatePath('/');
        return { success: true, message: "Product updated successfully." };
    });
}

export async function deleteProduct(productId: string) {
    return withPermission('product_delete', async () => {
        const id = Number(productId);
        const product = await prisma.product.findUnique({
            where: { id },
            select: { images: true }
        });

        if (!product) throw new Error('Product not found.');

        await deleteMultipleImages(product.images);
        await prisma.product.delete({ where: { id } });

        revalidatePath('/admin/products');
        revalidatePath('/');
        return { success: true, message: 'Product deleted successfully.' };
    });
}

export async function getProductById(id: number) {
    return withPermission('product_update', async () => {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                brand: true,
                category: true,
                subCategory: true,
                reviews: true,
                wishlists: true,
            }
        });
        return { success: true, product };
    });
}

export async function saveProductDraft(productId: number | null, formData: FormData) {
    return await withPermission('product_create', async () => {
        const title = formData.get('title') as string || "Untitled Draft";
        const titleFont = formData.get('titleFont') as string || "Inter";
        const description = formData.get('description') as string || "";
        const warranty = formData.get('warranty') as string || "";
        const priceString = formData.get('price') as string;
        const quantityString = formData.get('quantity') as string;
        const discountedPriceString = formData.get('discount_price') as string;
        const brandIdString = formData.get('brand_id') as string;
        const categoryIdString = formData.get('category_id') as string;
        const additionalInfo = formData.get('additional_information') as string || "";
        const imageUrls = formData.getAll('images') as string[];
        const specsRaw = formData.get('specifications') as string;
        const specifications = specsRaw ? JSON.parse(specsRaw) : {};
        // --- 2. Dynamic Specifications Extraction ---
        // const specifications: { [key: string]: string } = {};
        // for (const [key, value] of formData.entries()) {
        //     if (key.startsWith('spec-key-') && value) {
        //         const index = key.replace('spec-key-', '');
        //         const specValue = formData.get(`spec-value-${index}`) as string;
        //         if (specValue) {
        //             specifications[value.toString()] = specValue;
        //         }
        //     }
        // }

        // --- 3. Prepare Data Object ---
        const data: any = {
            title,
            titleFont,
            description,
            warranty,
            price: priceString ? Number(priceString) : 0,
            discountedPrice: discountedPriceString ? Number(discountedPriceString) : 0,
            quantity: quantityString ? Number(quantityString) : 0,
            status: 'draft',
            images: imageUrls,
            specifications: specifications,
            additionalInfo,
        };

        // Only add Relations if they are valid numbers
        if (brandIdString && !isNaN(parseInt(brandIdString))) {
            data.brandId = parseInt(brandIdString);
        } else {
            data.brandId = null
        }
        if (categoryIdString && !isNaN(parseInt(categoryIdString))) {
            data.categoryId = parseInt(categoryIdString);
        } else {
            data.categoryId = null
        }

        if (productId) {
            // Update existing draft
            const product = await prisma.product.update({
                where: { id: productId },
                data
            });
            return { success: true, id: product.id };
        } else {
            // Create new draft
            const product = await prisma.product.create({
                data: {
                    title,
                    titleFont,
                    description,
                    warranty,
                    price: priceString ? Number(priceString) : 0,
                    discountedPrice: discountedPriceString ? Number(discountedPriceString) : 0,
                    quantity: quantityString ? Number(quantityString) : 0,
                    status: 'draft',
                    images: imageUrls,
                    specifications: specifications,
                    additionalInfo,
                }
            });
            return { success: true, id: product.id };
        }
    });
}