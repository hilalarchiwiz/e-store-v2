import { getCategories, getProducts } from '@/lib/action/home.action';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://qaam.com";

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
    const { products } = await getProducts({});
    const productRoutes = (products || []).map((product: any) => ({
        url: `${baseUrl}/shop-details/${product.id}`,
        lastModified: new Date(product.updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 3. Dynamic Category Routes
    const { categories } = await getCategories();
    const categoryRoutes = (categories || []).map((category: any) => ({
        url: `${baseUrl}/shop?category=${category.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}