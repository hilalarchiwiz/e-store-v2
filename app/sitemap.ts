import { getStorefrontProductFilter } from "@/lib/storefront-products";
import prisma from '@/lib/prisma';
import { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const visibility = await getStorefrontProductFilter();
    const staticRoutes: MetadataRoute.Sitemap = [
        '/',
        '/about',
        '/contact',
        '/faq',
        '/shop',
        '/deals',
        '/blog',
        '/returns-exchanges',
    ].map((route) => ({
        url: absoluteUrl(route),
        changeFrequency: route === '/' || route === '/deals' ? 'daily' as const : 'weekly' as const,
        priority: route === '/' ? 1 : route === '/shop' || route === '/deals' ? 0.9 : 0.7,
    }));

    const [products, blogs, pages, categories, brands] = await Promise.all([
      prisma.product.findMany({
          where: visibility,
          select: { id: true, slug: true, updatedAt: true },
      }),
      prisma.blog.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.page.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.category.findMany({
          where: { status: 'active', products: { some: visibility } },
          select: { id: true, slug: true, updatedAt: true },
      }),
      prisma.brand.findMany({
          where: { status: 'active', products: { some: visibility } },
          select: { id: true, updatedAt: true },
      }),
    ]);

    const productRoutes = products.map((product) => ({
        url: absoluteUrl(`/product/${product.slug || product.id}`),
        lastModified: product.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const blogRoutes = blogs.map((blog) => ({
        url: absoluteUrl(`/blog/${blog.slug}`),
        lastModified: blog.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    const pageRoutes = pages.map((page) => ({
        url: absoluteUrl(`/${page.slug}`),
        lastModified: page.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    const categoryRoutes = categories.map((category) => ({
        url: absoluteUrl(`/shop?category=${encodeURIComponent(category.slug || String(category.id))}`),
        lastModified: category.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const brandRoutes = brands.map((brand) => ({
        url: absoluteUrl(`/shop?brand=${brand.id}`),
        lastModified: brand.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    const routes = [
      ...staticRoutes,
      ...categoryRoutes,
      ...brandRoutes,
      ...productRoutes,
      ...blogRoutes,
      ...pageRoutes,
    ];

    // Supplier imports can contain duplicate product slugs. A sitemap must
    // expose each canonical URL only once even when the underlying records are
    // duplicated.
    return Array.from(new Map(routes.map((route) => [route.url, route])).values());
}
