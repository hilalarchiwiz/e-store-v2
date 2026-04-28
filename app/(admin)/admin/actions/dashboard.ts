'use server'

import prisma from "@/lib/prisma";

export async function getDashboardStats() {
    try {
        const [
            totalProducts,
            totalCategories,
            totalBrands,
            recentViews,
            cartItems,
            wishlistItems
        ] = await Promise.all([
            prisma.product.count(),
            prisma.category.count(),
            prisma.brand.count(),
            prisma.recentlyViewed.count(),
            prisma.cart.aggregate({ _sum: { quantity: true } }),
            prisma.wishlist.count()
        ]);

        // Calculate average price
        const priceStats = await prisma.product.aggregate({
            _avg: { price: true },
            _sum: { price: true }
        });

        return {
            success: true,
            stats: {
                totalProducts,
                totalCategories,
                totalBrands,
                recentViews,
                cartItems: cartItems._sum.quantity || 0,
                wishlistItems,
                avgPrice: priceStats._avg.price || 0,
                totalValue: priceStats._sum.price || 0
            }
        };
    } catch (err) {
        const error = err as Error;
        console.error('Error fetching dashboard stats:', error);
        return { success: false, message: error.message };
    }
}

export async function getRecentActivity() {
    try {
        const recentViews = await prisma.recentlyViewed.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                product: {
                    select: { title: true, images: true, price: true }
                }
            }
        });

        return {
            success: true,
            activities: recentViews.map(view => ({
                id: view.id,
                type: 'view',
                productName: view.product.title,
                image: view.product.images[0] || '',
                timestamp: view.createdAt,
                userId: view.userId || view.anonymousId
            }))
        };
    } catch (err) {
        const error = err as Error;
        console.error('Error fetching recent activity:', error);
        return { success: false, activities: [] };
    }
}

export async function getTopProducts() {
    try {
        // Get products with most views
        const topViewed = await prisma.recentlyViewed.groupBy({
            by: ['productId'],
            _count: { productId: true },
            orderBy: { _count: { productId: 'desc' } },
            take: 10
        });

        const productIds = topViewed.map(item => item.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            include: { category: true, brand: true }
        });

        const productsWithViews = products.map(product => {
            const viewData = topViewed.find(v => v.productId === product.id);
            return {
                ...product,
                viewCount: viewData?._count.productId || 0
            };
        });

        return {
            success: true,
            products: productsWithViews
        };
    } catch (err) {
        const error = err as Error;
        console.error('Error fetching top products:', error);
        return { success: false, products: [] };
    }
}

export async function getCategoryDistribution() {
    try {
        const distribution = await prisma.category.findMany({
            include: {
                _count: { select: { products: true } }
            },
            orderBy: {
                products: { _count: 'desc' }
            }
        });

        return {
            success: true,
            data: distribution.map(cat => ({
                name: cat.title,
                count: cat._count.products,
                id: cat.id
            }))
        };
    } catch (err) {
        const error = err as Error;
        console.error('Error fetching category distribution:', error);
        return { success: false, data: [] };
    }
}