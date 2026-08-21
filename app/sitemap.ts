import prisma from '@/lib/prisma';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://qaam.pk";

    // 1. Static Routes
    const staticRoutes = [
        '',
        '/about',
        '/contact',
        '/faq',
        '/shop',
        '/blog',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // 2. Dynamic Product Routes
    const products = await prisma.product.findMany({
        where: { status: 'active' },
        select: { id: true, updatedAt: true },
    });
    const productRoutes = products.map((product) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 3. Dynamic Category Routes
    const categories = await prisma.category.findMany({
        where: { status: 'active' },
        select: { id: true, updatedAt: true },
    });
    const categoryRoutes = categories.map((category) => ({
        url: `${baseUrl}/shop?category=${category.id}`,
        lastModified: category.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
