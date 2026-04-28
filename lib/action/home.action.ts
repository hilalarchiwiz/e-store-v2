'use server'
import { revalidatePath } from "next/cache"
import { PAGE_SIZE } from "../constant"
import generateSession from "../generate-session"
import prisma from "../prisma"
import { getOrCreateAnonymousId } from "../session"
import { ContactSchema } from "../validation/contact.validation"
import { SubscribeSchema } from "../validation/subscribe.validation"
import { ReviewSchema } from "../validations/review"
interface BillingAddressInput {
    firstName: string;
    lastName: string;
    company?: string;
    country: string;
    streetAddress: string;
    apartment?: string;
    city: string;
    state?: string;
    phone: string;
    email: string;
}

export async function getSliders() {
    try {
        const sliders = await prisma.slider.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        })

        if (sliders.length === 0) {
            return {
                success: true,
                message: 'No sliders found.',
                sliders: []
            }
        }

        return {
            success: true,
            message: 'sliders fetched successfully',
            sliders: sliders,
        }

    } catch (err) {
        // 3. Improve error handling by checking if the error is a recognized type
        const error = err as Error | { message: string }

        console.error('Error fetching sliders:', error) // Log the error for debugging

        return {
            success: false,
            message: error.message || 'An unknown error occurred while fetching categories.',
        }
    }
}

export async function getCategories({ searchParams = {} } = {}) {
    try {
        const { brand, search } = searchParams;

        // Build the base where clause (excluding current category selection)
        const baseWhere: any = {};
        if (brand) baseWhere.brandId = Number(brand);
        if (search) {
            baseWhere.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: {
                        products: {
                            where: {
                                ...baseWhere,
                                status: 'active'
                            }

                        }
                    }
                }
            }
        });

        if (categories.length === 0) {
            return {
                success: true,
                message: 'No categories found.',
                categories: []
            }
        }

        return {
            success: true,
            message: 'categories fetched successfully',
            categories: categories,
        }

    } catch (err) {
        // 3. Improve error handling by checking if the error is a recognized type
        const error = err as Error | { message: string }

        console.error('Error fetching categories:', error) // Log the error for debugging

        return {
            success: false,
            message: error.message || 'An unknown error occurred while fetching categories.',
        }
    }
}

export async function getBrands({ searchParams = {} } = {}) {
    try {
        const { category, minPrice, maxPrice, search } = searchParams;

        const baseWhere: any = {};
        if (category) baseWhere.categoryId = Number(category);
        if (search) {
            baseWhere.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        const brands = await prisma.brand.findMany({
            include: {
                _count: {
                    select: {
                        products: {
                            where: {
                                ...baseWhere,
                                status: 'active' // Add this
                            }
                        }
                    }
                }
            }
        });

        if (brands.length === 0) {
            return {
                success: true,
                message: 'No brands found.',
                brands: []
            }
        }

        return {
            success: true,
            message: 'brands fetched successfully',
            brands: brands,
        }

    } catch (err) {
        // 3. Improve error handling by checking if the error is a recognized type
        const error = err as Error | { message: string }

        console.error('Error fetching brands:', error) // Log the error for debugging

        return {
            success: false,
            message: error.message || 'An unknown error occurred while fetching categories.',
        }
    }
}

export async function getProductById(id: number) {
    try {
        const product = await prisma.product.findUnique({
            where: {
                id: id,
                status: 'active' // Add this line
            },
            include: {
                category: true,
                brand: true,
                reviews: {
                    select: {
                        id: true,
                        comment: true,
                        rating: true,
                        name: true,
                        email: true,
                    }
                },
            }
        })

        if (!product) {
            return {
                success: false,
                message: 'No product found.',
                product: null
            }
        }

        return {
            success: true,
            message: 'product fetched successfully',
            product: product,
        }

    } catch (err) {
        // 3. Improve error handling by checking if the error is a recognized type
        const error = err as Error | { message: string }

        console.error('Error fetching product:', error) // Log the error for debugging

        return {
            success: false,
            message: error.message || 'An unknown error occurred while fetching product.',
        }
    }
}

export async function getCategoryProduct(categoryId: number | undefined) {
    try {
        const products = await prisma.product.findMany({
            where: {
                categoryId,
                status: 'active' // Add this line
            },
            include: {
                category: true,
                brand: true,
                reviews: {
                    select: {
                        id: true,
                        comment: true,
                        rating: true,
                        name: true,
                        email: true,
                    }
                },
            }
        })

        if (!products) {
            return {
                success: false,
                message: 'No product found.',
                product: null
            }
        }

        return {
            success: true,
            message: 'product fetched successfully',
            products: products,
        }

    } catch (err) {
        // 3. Improve error handling by checking if the error is a recognized type
        const error = err as Error | { message: string }

        console.error('Error fetching product:', error) // Log the error for debugging

        return {
            success: false,
            message: error.message || 'An unknown error occurred while fetching product.',
        }
    }
}

export async function getProducts({
    categoryId,
    searchParams = {}
}: {
    categoryId?: number;
    searchParams?: {
        category?: string;
        brand?: string;
        minPrice?: string;
        maxPrice?: string;
        sort?: string;
        page?: string;
        search?: string;
        stock?: boolean;
    }
}) {
    try {
        const { category, brand, minPrice, maxPrice, sort, page = "1", search, stock } = searchParams;
        const session = await generateSession();
        const userId = session?.user.id;
        const anonymousId = await getOrCreateAnonymousId();
        const currentPage = Math.max(Number(page), 1);
        const skip = (currentPage - 1) * PAGE_SIZE;

        // 1. Build the filter object
        const where: any = {
            status: 'active' // Add this line - filter only active products
        };
        if (categoryId) {
            where.categoryId = categoryId;
        } else if (category) {
            where.categoryId = Number(category);
        }
        if (stock == true) {
            where.quantity = { gt: 0 };
        }

        if (search) {
            where.OR = [
                ...(where.OR || []),
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (brand) {
            where.brandId = Number(brand);
        }

        // Price Logic
        if (minPrice || maxPrice) {
            const min = minPrice ? Number(minPrice) : 0;
            const max = maxPrice ? Number(maxPrice) : 9999999;

            where.OR = [
                { discountedPrice: { gte: min, lte: max } },
                {
                    AND: [
                        { OR: [{ discountedPrice: null }, { discountedPrice: 0 }] },
                        { price: { gte: min, lte: max } }
                    ]
                }
            ];
        }

        // 2. Build the Sort object
        let orderBy: any = { createdAt: "desc" }; // Default
        switch (sort) {
            case "price-asc": orderBy = { price: "asc" }; break;
            case "price-desc": orderBy = { price: "desc" }; break;
            case "a-z": orderBy = { title: "asc" }; break;
            case "z-a": orderBy = { title: "desc" }; break;
            case "oldest": orderBy = { createdAt: "asc" }; break;
        }

        // 3. Execute Query
        const [products, totalCount] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy,
                include: {
                    category: true,
                    brand: true,
                    reviews: {
                        select: {
                            id: true,
                            comment: true,
                            rating: true,
                            name: true,
                            email: true,
                        }
                    },
                    wishlists: {
                        where: {
                            OR: [
                                { userId: userId || undefined },
                                { anonymousId: anonymousId || undefined }
                            ].filter(condition => Object.values(condition)[0] !== undefined)
                        },
                        select: {
                            id: true,
                            userId: true,
                            anonymousId: true,
                        }
                    }
                },
                take: PAGE_SIZE,
                skip: skip
            }),
            prisma.product.count({ where })
        ]);


        const productsWithStatus = products.map(product => ({
            ...product,
            isInWishlist: product.wishlists.length > 0
        }));

        return {
            success: true,
            products: productsWithStatus || [],
            totalCount: totalCount || 0,
            showingCount: products.length || 0,
            totalPages: Math.ceil(totalCount / PAGE_SIZE),
            currentPage,
        };
    } catch (err) {
        console.error('Error fetching products:', err);
        return { success: false, products: [], totalCount: 0, totalPages: 0, currentPage: 1 };
    }
}

export async function getPriceRange() {
    const stats = await prisma.product.aggregate({
        where: { status: 'active' }, // Add this line
        _min: { discountedPrice: true },
        _max: { price: true },
    });

    return {
        min: stats._min.discountedPrice || 0,
        max: stats._max.price || 100000, // Fallback if no products exist
    };
}

export async function getRandomProducts() {
    try {
        // 1. Get the total number of products
        const productCount = await prisma.product.count({
            where: { status: 'active' } // Add this line
        });
        if (productCount === 0) return { success: true, products: [] };

        const skip = Math.max(0, Math.floor(Math.random() * productCount) - 2);

        const products = await prisma.product.findMany({
            where: { status: 'active' }, // Add this line
            take: 2,
            skip: skip,
            include: {
                category: true,
                brand: true,
            },
        });

        return {
            success: true,
            products: products,
        };
    } catch (err) {
        console.error("Error fetching random products:", err);
        return { success: false, products: [] };
    }
}

export async function trackProductView(productId: number, userId?: string) {
    const anonymousId = await getOrCreateAnonymousId();
    if (!userId && !anonymousId) return;

    const specificFilter = userId
        ? { userId: userId, productId: productId }
        : { anonymousId: anonymousId, productId: productId };

    const existingRecord = await prisma.recentlyViewed.findFirst({
        where: specificFilter
    });

    if (existingRecord) {
        await prisma.recentlyViewed.update({
            where: { id: existingRecord.id },
            data: { createdAt: new Date() }
        });
        return {
            success: true,
            message: 'Product time update successfully'
        }
    } else {
        await prisma.recentlyViewed.create({
            data: {
                productId,
                userId: userId || null,
                anonymousId: anonymousId,
            }
        });
        return {
            success: true,
            message: 'Product added successfully'
        }
    }
}

export async function getRecentlyViewedProducts(userId?: string, page: number = 1, pageSize: number = PAGE_SIZE) {
    try {
        const anonymousId = await getOrCreateAnonymousId();
        const whereClause = userId ? { userId } : { anonymousId: anonymousId };

        // 1. Get total count for pagination math
        const totalCount = await prisma.recentlyViewed.count({ where: whereClause });
        const totalPages = Math.ceil(totalCount / pageSize);

        // 2. Fetch paginated results
        const recentViews = await prisma.recentlyViewed.findMany({
            where: whereClause,
            take: pageSize,
            skip: (page - 1) * pageSize, // Calculate how many items to skip
            orderBy: { createdAt: 'desc' },
            include: {
                product: {
                    include: { category: true, brand: true }
                }
            }
        });

        return {
            success: true,
            products: recentViews.map(view => view.product),
            totalPages,
            totalCount
        };
    } catch (error) {
        console.error("Error:", error);
        return { success: false, products: [], totalPages: 0 };
    }
}

export async function addProductToWishlist(productId: number, userId: string | undefined) {
    try {
        // 1. Determine who is adding the product
        const anonymousId = await getOrCreateAnonymousId();

        // 2. Build the query filter based on login status
        const userFilter = userId
            ? { userId }
            : { anonymousId };

        // 3. Check if the product is already in the wishlist for this specific guest/user
        const existing = await prisma.wishlist.findFirst({
            where: {
                productId,
                ...userFilter
            }
        });

        if (existing) {
            return { success: false, message: "Already in your wishlist" };
        }

        // 4. Create the entry in DB
        await prisma.wishlist.create({
            data: {
                productId,
                userId: userId || null,
                anonymousId: userId ? null : anonymousId,
            }
        });
        revalidatePath('/wishlist')
        return { success: true, message: "Added successfully" };
    } catch (err) {
        const error = err as Error;
        console.error("Error:", error);
        return { success: false, message: error.message };
    }
}

export async function getProductToWishlists(userId: string | undefined) {
    try {
        // 1. Determine who is adding the product
        const anonymousId = await getOrCreateAnonymousId();
        const items = await prisma.wishlist.findMany({
            where: {
                OR: [
                    { userId: userId || "undefined" },
                    { anonymousId: anonymousId || "undefined" }
                ]
            },
            include: { product: true }
        });
        if (items) {
            const serializedData = items.map((item) => ({
                id: item.product.id, // Using the Product's ID
                title: item.product.title,
                price: item.product.price,
                discountedPrice: item.product.discountedPrice,
                quantity: 1, // Default quantity for wishlist
                status: 'active', // Example mapping
                images: item.product.images, // Assuming this is an array in DB
            }));

            return { success: true, data: serializedData };
        } else {
            return {
                success: false,
                message: 'Record not found'
            }
        }

    } catch (err) {
        const error = err as Error;
        console.error("Error:", error);
        return { success: false, message: error.message };
    }
}

export async function removeProductFromWishlist(productId: number, userId: string | undefined) {
    try {
        // 1. Determine who is adding the product
        const anonymousId = await getOrCreateAnonymousId();
        const userFilter = userId
            ? { userId }
            : { anonymousId: anonymousId };

        await prisma.wishlist.deleteMany({
            where: {
                productId: productId,
                ...userFilter
            }
        });

        return { success: true, message: "Removed from wishlist" };

    } catch (err) {
        const error = err as Error;
        console.error("Error:", error);
        return { success: false, message: error.message };
    }
}

export async function removeAllProductFromWishlist() {
    try {
        const session = await generateSession();
        const user = session?.user;
        // 1. Determine the session context
        const anonymousId = await getOrCreateAnonymousId();
        const userFilter = user
            ? { userId: user?.id }
            : { anonymousId: anonymousId };

        // 2. Delete all records matching the user filter
        await prisma.wishlist.deleteMany({
            where: {
                ...userFilter
            }
        });

        return { success: true, message: "Wishlist cleared successfully" };

    } catch (err) {
        const error = err as Error;
        console.error("Error clearing wishlist:", error);
        return { success: false, message: error.message };
    }
}

export async function addOrUpdateCartItem(productId: number, quantity: number, userId?: string | undefined) {
    try {
        const anonymousId = await getOrCreateAnonymousId();
        const session = await generateSession();
        const user = session?.user;
        const userFilter = user ? { userId: user.id } : { anonymousId };

        // 1. Fetch current stock and existing cart item in parallel for performance
        const [productStock, existingCartItem] = await Promise.all([
            prisma.product.findUnique({
                where: { id: productId },
                select: { quantity: true, title: true }
            }),
            prisma.cart.findFirst({
                where: { productId, ...userFilter }
            })
        ]);

        if (!productStock) {
            return { success: false, message: 'Product not found' };
        }

        // 2. Calculate the "Total Quantity" the user wants in their cart
        const currentInCart = existingCartItem ? existingCartItem.quantity : 0;
        const totalRequestedQuantity = currentInCart + quantity;

        // 3. Validation: Check if total requested exceeds available stock
        if (quantity && quantity > productStock.quantity) {
            if (totalRequestedQuantity > productStock.quantity) {
                return {
                    success: false,
                    message: productStock.quantity === 0
                        ? "Product is out of stock"
                        : `Only ${productStock.quantity} units available. You already have ${currentInCart} in cart.`
                };
            }
        }

        // 4. Update or Create
        if (existingCartItem) {
            await prisma.cart.update({
                where: { id: existingCartItem.id },
                data: { quantity: totalRequestedQuantity }
            });
            return { success: true, message: "Cart updated successfully" };
        } else {
            await prisma.cart.create({
                data: {
                    productId,
                    quantity,
                    userId: userId || null,
                    anonymousId: userId ? null : anonymousId
                }
            });
            return { success: true, message: "Added to cart" };
        }
    } catch (err) {
        const error = err as Error;
        console.error("Error:", error);
        return { success: false, message: error.message };
    }
}

export async function removeProductFromCart(productId: number, userId?: string) {
    try {
        const session = await generateSession();
        const user = session?.user;
        const anonymousId = await getOrCreateAnonymousId();
        const userFilter = userId ? { userId: user?.id } : { anonymousId };
        await prisma.cart.deleteMany({ where: { productId, ...userFilter } });
        return {
            success: true,
            message: 'Item delete successfully'
        }
    } catch (err) {
        const error = err as Error;
        console.error("Error:", error);
        return { success: false, message: error.message };
    }
}

export async function removeAllProductFromCart() {
    try {
        const session = await generateSession();
        const user = session?.user;
        const anonymousId = await getOrCreateAnonymousId();

        // Define the filter based on whether the user is logged in
        const userFilter = user ? { userId: user?.id } : { anonymousId };

        // Delete all records matching that user/anonymous ID
        await prisma.cart.deleteMany({
            where: userFilter
        });

        return {
            success: true,
            message: 'Cart cleared successfully'
        }
    } catch (err) {
        const error = err as Error;
        console.error("Error clearing cart:", error);
        return { success: false, message: error.message };
    }
}

export async function getCarts(userId?: string) {
    try {
        const anonymousId = await getOrCreateAnonymousId();
        const userFilter = userId ? { userId } : { anonymousId };

        const items = await prisma.cart.findMany({
            where: userFilter,
            include: { product: true }
        });

        const serializedData = items.map(item => ({
            id: item.product.id,
            title: item.product.title,
            price: item.product.price,
            discountedPrice: item.product.discountedPrice,
            quantity: item.quantity,
            images: item.product.images,
        }));

        return { success: true, data: serializedData };
    } catch (err) {
        const error = err as Error;
        console.error("Error:", error);
        return { success: false, message: error.message };
    }
}

export async function increaseProductFromCart(productId: number, userId?: string) {
    try {
        const anonymousId = await getOrCreateAnonymousId();
        const userFilter = userId ? { userId } : { anonymousId };

        const item = await prisma.cart.findFirst({
            where: { productId, ...userFilter }
        });

        if (!item) return { success: false, message: "Item not found" };
        await prisma.cart.updateMany({
            where: {
                productId,
                ...userFilter
            },
            data: {
                quantity: { increment: 1 }
            }
        });

        return { success: true, message: "Quantity increased" };
    } catch (err) {
        const error = err as Error;
        console.error("Error decreasing quantity:", err);
        return { success: false, message: error.message };
    }
}

export async function decreaseProductFromCart(productId: number, userId?: string) {
    try {
        const anonymousId = await getOrCreateAnonymousId();
        const userFilter = userId ? { userId } : { anonymousId };

        // 1. Find the item first to check current quantity
        const item = await prisma.cart.findFirst({
            where: { productId, ...userFilter }
        });

        if (!item) return { success: false, message: "Item not found" };
        if (item.quantity <= 1) {
            await prisma.cart.delete({ where: { id: item.id } });
        } else {
            await prisma.cart.update({
                where: { id: item.id },
                data: { quantity: { decrement: 1 } }
            });
        }

        return { success: true, message: "Quantity decreased" };
    } catch (err) {
        const error = err as Error;
        console.error("Error decreasing quantity:", err);
        return { success: false, message: error.message };
    }
}

export async function mergeGuestDataToUser(userId: string) {
    try {
        const anonymousId = await getOrCreateAnonymousId();
        // Find guest items and user items to prevent duplicates
        await prisma.$transaction([
            // Update Cart
            prisma.cart.updateMany({
                where: { anonymousId: anonymousId },
                data: { userId: userId },
            }),
            // Update Wishlist
            prisma.wishlist.updateMany({
                where: { anonymousId: anonymousId },
                data: { userId: userId },
            }),
            // Update Recently Viewed
            prisma.recentlyViewed.updateMany({
                where: { anonymousId: anonymousId },
                data: { userId: userId },
            }),
        ]);

        return { success: true };
    } catch (error) {
        const err = error as Error;
        console.error("Failed to merge guest data:", error);
        return { success: false, message: err.message };
    }
}

export async function submitReview(prevState: any, formData: FormData) {
    console.log(formData);
    const rawData = {
        rating: formData.get("rating"),
        comment: formData.get("comment"),
        name: formData.get("name"),
        email: formData.get("email"),
        productId: formData.get("productId"),
    };


    const session = await generateSession();
    const userId = session?.user?.id;

    const anonymousId = await getOrCreateAnonymousId();

    // 1. Validate with Zod
    const validatedFields = ReviewSchema.safeParse(rawData);


    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error,
            error: "Please fix the errors in the form.", // This string goes to toast
        };
    }

    const { rating, comment, name, email, productId } = validatedFields.data;
    try {
        await prisma.review.create({
            data: {
                rating,
                comment,
                productId: Number(productId),
                userId: userId ? userId : null,
                anonymousId: userId ? null : anonymousId,
                name,
                email,
            },
        });

        revalidatePath(`/shop-details/${productId}`);
        return { success: true, message: "Review add successfully" };
    } catch (error) {
        const err = error as Error;
        return {
            success: false,
            message: err.message
        }
    }
}

export async function getReviews(productId: number | undefined) {
    try {
        const reviews = await prisma.review.findMany({
            orderBy: {
                id: 'desc'
            },
            where: {
                productId: Number(productId),
            },
            include: { product: true }
        });
        return {
            success: true,
            reviews
        }
    } catch (err) {
        const error = err as Error;
        return {
            success: false,
            message: error.message
        }
    }
}

export async function getLatestReviews() {
    try {
        const reviews = await prisma.review.findMany({
            orderBy: {
                id: 'desc'
            },
            select: {
                id: true,
                comment: true,
                rating: true,
                name: true,
                email: true,
            }
        });
        return {
            success: true,
            reviews
        }
    } catch (err) {
        const error = err as Error;
        return {
            success: false,
            message: error.message
        }
    }
}

export async function getWishlistCount() {
    try {
        const anonymousId = await getOrCreateAnonymousId();
        // const userId = user?.id;
        const session = await generateSession();
        const userId = session?.user?.id;
        if (!userId && !anonymousId) return 0;

        const count = await prisma.wishlist.count({
            where: {
                OR: [
                    { userId: userId || undefined },
                    { anonymousId: anonymousId || undefined },
                ].filter(Boolean), // Cleans up null/undefined entries
            },
        });

        return count;
    } catch (error) {
        console.error("Error getting wishlist count:", error);
        return 0;
    }
}

// Get user orders
export async function getUserOrders() {
    try {
        const session = await generateSession();
        const user = session?.user;
        if (!user) {
            return { success: false, error: "User not found" };
        }
        const orders = await prisma.order.findMany({
            where: { userId: user?.id },
            include: {
                orderItems: {
                    include: {
                        product: true
                    },
                },
                billingAddress: true,
                shippingAddress: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, orders };
    } catch (error) {
        console.error("Get orders error:", error);
        return { success: false, error: "Failed to fetch orders" };
    }
}

export async function getUserAddress() {
    try {
        const session = await generateSession();
        const user = session?.user;
        if (!user) {
            return { success: false, error: "User not found" };
        }
        const address = await prisma.address.findFirst({
            where: { userId: user?.id },
        });
        return { success: true, address };
    } catch (error) {
        const err = error as Error;
        console.error("Get address error:", error);
        return { success: false, error: err.message };
    }
}

export async function saveUserAddress(prevData: any, formData: FormData) {
    try {
        const session = await generateSession();
        const user = session?.user;
        if (!user) {
            return { success: false, error: "User not found" };
        }

        const addressData: BillingAddressInput = {
            firstName: formData.get("firstName") as string,
            lastName: formData.get("lastName") as string,
            company: formData.get("company") as string || undefined,
            country: formData.get("country") as string,
            streetAddress: formData.get("streetAddress") as string,
            apartment: formData.get("apartment") as string || undefined,
            city: formData.get("city") as string,
            state: formData.get("state") as string || undefined,
            phone: formData.get("phone") as string,
            email: formData.get("email") as string,
        };

        // Check if address already exists
        const existingAddress = await prisma.address.findFirst({
            where: { userId: user?.id },
        });
        if (existingAddress) {
            // Update existing address
            await prisma.address.update({
                where: { id: existingAddress.id },
                data: { ...addressData },
            });
        } else {
            // Create new address
            await prisma.address.create({
                data: {
                    ...addressData,
                    userId: user?.id,
                },
            });
        }

        revalidatePath('/my-account/addresses');
        return { success: true, message: "Address saved successfully" };
    } catch (error) {
        const err = error as Error;
        console.error("Save address error:", error);
        return { success: false, error: err.message };
    }
}

export async function getPages() {
    try {
        const pages = await prisma.page.findMany({});
        return {
            success: true,
            pages,
        };
    } catch (err) {
        const error = err as Error;
        console.error("Error fetching Page:", error.message);
        return { pages: [], message: error.message, success: false };
    }
}

export async function getPageBySlug(slug: string) {
    try {
        const page = await prisma.page.findFirst({
            where: { slug: slug },
        });
        return {
            success: true,
            page,
        };
    } catch (err) {
        const error = err as Error;
        console.error("Error fetching Page:", error.message);
        return { page: null, message: error.message, success: false };
    }
}

export async function getFaqs() {
    try {
        const faqs = await prisma.faq.findMany({});
        return {
            success: true,
            faqs,
        };
    } catch (err) {
        const error = err as Error;
        console.error("Error fetching Page:", error.message);
        return { faqs: [], message: error.message, success: false };
    }
}

export async function subscribe(prevData: any, formData: FormData) {
    try {

        // 1. Extract data from FormData
        const rawData = {
            email: formData.get('email'),
        };

        // 2. Validate using the external schema
        const validatedFields = SubscribeSchema.safeParse(rawData);

        // 3. If validation fails, return the specific errors
        if (!validatedFields.success) {
            return {
                success: false,
                // Returns the first error message found
                message: validatedFields.error.flatten().fieldErrors.email?.[0] || 'Invalid input',
            };
        }

        await prisma.subscribe.create({
            data: {
                email: validatedFields.data.email,
            },
        });

        return {
            success: true,
            message: "Subscribed successfully",
        };
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, message: 'Email already exists' };
        }
        return {
            success: false,
            message: error.message,
        };
    }
}

export async function getBanners() {
    try {
        const banners = await prisma.banner.findMany({});
        return {
            success: true,
            banners
        }
    } catch (err) {
        const error = err as Error;
        console.error("Error fetching Page:", error.message);
        return { banners: [], message: error.message, success: false };
    }
}

export async function getAboutGrid(type: string) {
    try {
        const about_contents = await prisma.whatWeDo.findMany({
            where: {
                type
            }
        })

        return {
            success: true,
            about_contents
        }
    } catch (error) {
        const err = error as Error;
        return {
            success: false,
            message: err.message
        }
    }
}

export async function getTeams() {
    try {
        const teams = await prisma.team.findMany({
            orderBy: {
                id: 'desc'
            }
        })

        return {
            success: true,
            teams
        }
    } catch (error) {
        const err = error as Error;
        return {
            success: false,
            message: err.message
        }
    }
}

export async function getBlogs({
    page = 1,
    pageSize = PAGE_SIZE,
    tag
}: {
    page?: number,
    pageSize?: number,
    tag?: string
}) {
    try {
        const skip = (page - 1) * pageSize;

        // Build the where clause dynamically
        const where = tag && tag !== "All Posts"
            ? { tag: tag }
            : {};

        const [blogs, totalCount] = await Promise.all([
            prisma.blog.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.blog.count({ where })
        ]);

        return {
            success: true,
            blogs,
            totalPages: Math.ceil(totalCount / pageSize),
            currentPage: page
        }
    } catch (err) {
        const error = err as Error | { message: string }
        return {
            success: false,
            message: error.message
        }
    }
}

export async function getAllUniqueTags() {
    try {
        // Use groupBy to let the database find unique tags
        const groups = await prisma.blog.groupBy({
            by: ['tag'],
            where: {
                tag: { not: "" } // Optional: exclude empty strings
            }
        });
        return groups.map(group => group.tag);
    } catch (err) {
        console.error("Error fetching tags:", err);
        return [];
    }
}

export async function getBlogDetails(slug: string) {
    try {
        const blog = await prisma.blog.findFirst({
            where: {
                slug
            }
        });
        return {
            success: true,
            blog
        }
    } catch (err) {
        const error = err as Error | { message: string }
        return {
            success: false,
            message: error.message
        }
    }
}

export async function contact(prevData: any, formData: FormData) {
    try {
        // 1. Convert FormData to a plain object
        const rawData = Object.fromEntries(formData.entries());

        // 2. Validate with Zod
        const validatedFields = ContactSchema.safeParse(rawData);

        // 3. Return early if validation fails
        if (!validatedFields.success) {
            const flattenedErrors = Object.values(
                validatedFields.error.flatten().fieldErrors
            ).flat();

            return {
                success: false,
                message: flattenedErrors, // Now this is an array ['Invalid email', 'Name too short']
            };
        }

        // 4. Execute Prisma Create
        await prisma.contact.create({
            data: validatedFields.data,
        });

        return {
            success: true,
            message: "Message sent successfully!",
        };
    } catch (error) {
        const err = error as Error;
        return {
            success: false,
            message: err.message,
        };
    }
}

export async function incrementBlogViews(id: number) {
    try {
        const blog = await prisma.blog.findFirst({
            where: {
                id
            }
        });

        if (!blog) {
            return {
                success: false,
                message: 'blog not found'
            }
        }
        await prisma.blog.update({
            where: { id },
            data: {
                views: {
                    increment: 1,
                },
            },
        });
        // revalidatePath('/blogs')
        // revalidatePath('/blogs/blog-details/' + blog?.slug)
    } catch (error) {
        console.error("Failed to update views:", error);
    }
}