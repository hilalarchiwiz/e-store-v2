import { Product } from '@/types/product';
// 'use server';

// import { deleteMultipleImages } from "@/lib/action/FileUpload";
// import { PAGE_SIZE } from "@/lib/constant";
// import prisma from "@/lib/prisma";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";


// export async function getCategoriesBySearch({
//     searchTerm = '',
//     skip = 0,
//     take = 50
// }: {
//     searchTerm?: string,
//     skip?: number,
//     take?: number
// }) {
//     try {
//         const categories = await prisma.category.findMany({
//             where: {
//                 status: 'active',
//                 title: {
//                     contains: searchTerm,
//                     mode: 'insensitive'
//                 }
//             },
//             orderBy: {
//                 title: 'asc'
//             },
//             skip: skip, // 💡 NEW: Skip this many records
//             take: take + 1, // 💡 TRICK: Request one extra record to check if more exist
//         });

//         // Check if we received the extra record
//         const hasMore = categories.length > take;
//         // Return only the requested number of records
//         const categoriesToReturn = categories.slice(0, take);

//         return {
//             success: true,
//             message: 'categories fetched successfully',
//             categories: categoriesToReturn,
//             hasMore: hasMore, // 💡 NEW: Tell the client if there's more data
//         }
//     } catch (err) {
//         return {
//             success: false,
//             message: 'An unknown error occurred while fetching categories.',
//             categories: [],
//             hasMore: false,
//         }
//     }
// }

// export async function getBrandsBySearch({
//     searchTerm = '',
//     skip = 0,
//     take = 50
// }: {
//     searchTerm?: string,
//     skip?: number,
//     take?: number
// }) {
//     try {
//         const brands = await prisma.brand.findMany({
//             where: {
//                 status: 'active',
//                 title: {
//                     contains: searchTerm,
//                     mode: 'insensitive'
//                 }
//             },
//             orderBy: {
//                 title: 'asc'
//             },
//             skip: skip, // 💡 NEW: Skip this many records
//             take: take + 1, // 💡 TRICK: Request one extra record to check if more exist
//         });

//         // Check if we received the extra record
//         const hasMore = brands.length > take;
//         // Return only the requested number of records
//         const brandsToReturn = brands.slice(0, take);

//         return {
//             success: true,
//             message: 'Brands fetched successfully',
//             brands: brandsToReturn,
//             hasMore: hasMore, // 💡 NEW: Tell the client if there's more data
//         }
//     } catch (err) {
//         return {
//             success: false,
//             message: 'An unknown error occurred while fetching brands.',
//             brands: [],
//             hasMore: false,
//         }
//     }
// }
// // The ProductUpdateData type is used to structure the data for update
// interface ProductUpdateData {
//     title: string;
//     titleFont: string;
//     description: string;
//     warranty: string;
//     price: number;
//     discountedPrice?: number;
//     brandId: number;
//     quantity: number;
//     categoryId: number;
//     status: string;
//     images: string[];
//     specifications: { [key: string]: string };
//     additionalInfo: string;
// }

// // Helper function to extract and validate data (used by both create and update)
// function extractAndValidateProductData(formData: FormData): ProductUpdateData {
//     const title = formData.get('title') as string;
//     const titleFont = formData.get('titleFont') as string;
//     const description = formData.get('description') as string;
//     const warranty = formData.get('warranty') as string;
//     const priceString = formData.get('price') as string;
//     const quantity = formData.get('quantity') as string;
//     const discountedPriceString = formData.get('discount_price') as string | null;
//     const brandIdString = formData.get('brand_id') as string;
//     const categoryIdString = formData.get('category_id') as string;
//     const status = formData.get('status') as string;
//     const additionalInfo = formData.get('additional_information') as string;
//     const imageUrls = formData.getAll('images') as string[];

//     // --- Validation (similar to your create action) ---
//     if (!title || !description || !priceString || !brandIdString || !categoryIdString || !warranty) {
//         throw new Error('Missing required fields.');
//     }

//     // const price = parseFloat(priceString);
//     // const discountedPrice = discountedPriceString ? parseFloat(discountedPriceString) : undefined;
//     const brandId = parseInt(brandIdString);
//     const categoryId = parseInt(categoryIdString);

//     // if (isNaN(price) || isNaN(brandId) || isNaN(categoryId) || (discountedPrice !== undefined && isNaN(discountedPrice))) {
//     //     throw new Error('Invalid number format for price, brandId, or categoryId');
//     // }

//     // --- Specification Extraction ---
//     const specifications: { [key: string]: string } = {};
//     for (const [key, value] of formData.entries()) {
//         if (key.startsWith('spec-key-') && value) {
//             const index = key.replace('spec-key-', '');
//             const valueKey = `spec-value-${index}`;
//             const specValue = formData.get(valueKey) as string;
//             if (specValue) {
//                 specifications[value.toString()] = specValue;
//             }
//         }
//     }

//     return {
//         title, description, warranty,
//         price: Number(priceString),
//         discountedPrice: Number(discountedPriceString),
//         brandId,
//         categoryId,
//         quantity: Number(quantity),
//         status,
//         images: imageUrls,
//         specifications,
//         additionalInfo: additionalInfo,
//         titleFont: titleFont
//     };
// }

// // --- NEW ACTION: updateProduct ---
// export async function updateProduct(productId: number | undefined, prevData: any, formData: FormData) {
//     try {
//         const data = extractAndValidateProductData(formData);
//         console.log(data)
//         // 1. Fetch current product to check old images (for cleanup)
//         const oldProduct = await prisma.product.findUnique({
//             where: { id: productId },
//             select: { images: true }
//         });

//         // 2. Perform the database update
//         await prisma.product.update({
//             where: { id: productId },
//             data: {
//                 title: data.title,
//                 titleFont: data.titleFont,
//                 description: data.description,
//                 warranty: data.warranty,
//                 price: data.price,
//                 discountedPrice: data.discountedPrice,
//                 brandId: data.brandId,
//                 quantity: data.quantity,
//                 categoryId: data.categoryId,
//                 status: 'active',
//                 additionalInfo: data.additionalInfo,
//                 images: data.images,
//                 specifications: data.specifications,
//             },
//         });

//         // 3. Image Cleanup (Delete old images that are NOT in the new list)
//         const newImageUrls = data.images;
//         const imagesToKeep = new Set(newImageUrls);
//         const imagesToDelete = (oldProduct?.images || []).filter(url => !imagesToKeep.has(url));

//         if (imagesToDelete.length > 0) {
//             // This is the call to your Azure/S3 action
//             await deleteMultipleImages(imagesToDelete);
//         }
//         return {
//             success: true,
//             message: 'Product updated successfully'
//         }

//     } catch (error: any) {
//         console.error(`Error updating product ID ${productId}:`, error);
//         return {
//             success: false,
//             message: error.message || 'Failed to update product. Check server logs.'
//         };
//     }

//     revalidatePath('/admin/products');
//     revalidatePath('/');
//     revalidatePath(`/admin/products/${productId}/edit`);
//     redirect('/admin/products');
// }

// // Modify existing createProduct to use the validation helper
// export async function createProduct(prevData: any, formData: FormData): Promise<{ success: boolean; message: string }> {
//     let product;
//     try {
//         const data = extractAndValidateProductData(formData);

//         product = await prisma.product.create({
//             data: {
//                 ...data,
//                 // titleFont:data.titleFont,
//                 status: 'active',
//                 brandId: data.brandId,
//                 categoryId: data.categoryId,
//             }
//         });


//     } catch (error: any) {
//         return { success: false, message: error.message || 'Failed to create product.' };
//     }

//     revalidatePath('/admin/products');
//     revalidatePath('/');
//     revalidatePath('/shop')
//     revalidatePath('/shop-details/' + product.id);
//     redirect('/admin/products');
//     return {
//         success: true,
//         message: 'Product add successfully'
//     }
// }
// export async function getAllProducts(searchParams: { search?: string; page?: string; limit?: string }) {
//     try {
//         const query = searchParams.search || "";
//         const currentPage = Number(searchParams.page) || 1;
//         const itemsPerPage = Number(searchParams.limit) || PAGE_SIZE;
//         const skip = (currentPage - 1) * itemsPerPage;

//         const whereClause = query ? {
//             OR: [
//                 { title: { contains: query, mode: 'insensitive' as const } },
//                 { description: { contains: query, mode: 'insensitive' as const } },
//                 { brand: { title: { contains: query, mode: 'insensitive' as const } } },
//                 { category: { title: { contains: query, mode: 'insensitive' as const } } },
//             ]
//         } : {};
//         // Fetch data and total count simultaneously
//         const [products, totalCount] = await Promise.all([
//             prisma.product.findMany({
//                 where: whereClause,
//                 skip: skip,
//                 take: itemsPerPage,
//                 orderBy: { createdAt: 'desc' },
//                 include: { brand: true, category: true }
//             }),
//             prisma.product.count({ where: whereClause })
//         ]);

//         return {
//             success: true,
//             products,
//             totalPages: Math.ceil(totalCount / itemsPerPage),
//             totalCount: totalCount ?? 0
//         };
//     } catch (err) {
//         const error = err as Error;
//         console.error('Error in getAllProducts:', error.message);
//         return { products: [], totalPages: 0, success: false, message: error.message };
//     }
// }

// export async function deleteProduct(productId: string) {
//     try {
//         const product = await prisma.product.findUnique({
//             where: { id: Number(productId) },
//             select: { images: true }
//         });

//         if (!product) {
//             return {
//                 success: false,
//                 message: 'Product not found.',
//             };
//         }

//         // Delete images from Azure Blob Storage
//         await deleteMultipleImages(product.images);
//         await prisma.product.delete({
//             where: {
//                 id: Number(productId),
//             }
//         });
//         revalidatePath('/admin/products');
//         revalidatePath('/');
//         return {
//             success: true,
//             message: 'Product deleted successfully.',
//         }
//     } catch (err) {
//         console.error('Error deleting product:', err);
//         return {
//             success: false,
//             message: 'An unknown error occurred while deleting product.',
//         };
//     }
// }

// export async function getProductById(id: number) {
//     const product = await prisma.product.findUnique({
//         where: { id },
//         include: {
//             brand: true,
//             category: true,
//             reviews: true,
//             wishlists: true,
//         }
//     });
//     return {
//         success: true,
//         product
//     }
// }

'use server';

import { deleteMultipleImages } from "@/lib/action/FileUpload";
import { PAGE_SIZE } from "@/lib/constant";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { withPermission } from "@/lib/action-utils";

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
        quantity: Number(quantity),
        status: status || 'active',
        images: imageUrls,
        specifications,
        additionalInfo,
        titleFont
    };
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
    await withPermission('product_create', async () => {
        const data = extractAndValidateProductData(formData);
        const product = await prisma.product.create({
            data: { ...data }
        });

        revalidatePath('/admin/products');
        revalidatePath('/shop');
        revalidatePath('/');
        return { success: true, id: product.id };
    });
}

export async function updateProduct(productId: number | undefined, prevData: any, formData: FormData) {
    if (!productId) return { success: false, message: "Product ID is required" };

    await withPermission('product_update', async () => {
        const data = extractAndValidateProductData(formData);

        const oldProduct = await prisma.product.findUnique({
            where: { id: productId },
            select: { images: true, slug: true }
        });

        await prisma.product.update({
            where: { id: productId },
            data: { ...data },
        });

        // Image Cleanup
        const imagesToDelete = (oldProduct?.images || []).filter(url => !data.images.includes(url));
        if (imagesToDelete.length > 0) {
            await deleteMultipleImages(imagesToDelete);
        }

        revalidatePath('/admin/products');
        revalidatePath(`/shop-details/${oldProduct?.slug}`);
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
                reviews: true,
                wishlists: true,
            }
        });
        return { success: true, product };
    });
}