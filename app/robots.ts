import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://qaam.pk";

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/api/',
                '/dashboard',
                '/dashboard/',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
