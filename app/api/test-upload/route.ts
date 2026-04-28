import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // This maps your scraped JSON to your Prisma schema
        const product = await prisma.product.create({
            data: {
                title: body.title,
                description: body.description,
                price: body.price,
                discountedPrice: body.discountedPrice || 0,
                quantity: body.quantity || 10,
                warranty: body.warranty || "1 Year",
                status: 'active',
                images: body.images, // Array of URLs
                specifications: body.specifications || {},
                additionalInfo: body.additionalInfo || "",
                // Make sure these IDs exist in your DB or fetch them dynamically
                brandId: body.brandId,
                categoryId: body.categoryId,
            }
        });

        return NextResponse.json({ success: true, id: product.id });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}