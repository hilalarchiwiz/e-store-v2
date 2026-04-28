import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://qaam.com";

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/cart',
                '/checkout',
                '/register',
                '/signup',
                '/order-confirmation/',
                '/wishlist',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}