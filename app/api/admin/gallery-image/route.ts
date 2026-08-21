import { NextRequest, NextResponse } from 'next/server';
import { hasPermission } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { downloadManagedProductImage } from '@/lib/azure-product-images';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const allowed = await hasPermission('product_update');
    if (!allowed) {
        return NextResponse.json({ message: 'Unauthorized.' }, { status: 403 });
    }

    const productId = Number(request.nextUrl.searchParams.get('productId'));
    const imageUrl = request.nextUrl.searchParams.get('url');

    if (!Number.isInteger(productId) || productId <= 0 || !imageUrl) {
        return NextResponse.json({ message: 'Invalid image request.' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { images: true },
    });

    if (!product || !product.images.includes(imageUrl)) {
        return NextResponse.json({ message: 'Image not found for this product.' }, { status: 404 });
    }

    try {
        const image = await downloadManagedProductImage(imageUrl);

        return new Response(new Uint8Array(image.buffer), {
            headers: {
                'Content-Type': image.contentType,
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Unable to load the image.' },
            { status: 400 },
        );
    }
}
