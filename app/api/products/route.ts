// app/api/products/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const q = new URL(req.url).searchParams.get("q")?.trim();

    if (!q) {
        return NextResponse.json(
            { error: 'Missing "q" param.' },
            { status: 400 }
        );
    }

    const products = await prisma.product.findMany({
        where: {
            status: "active",
            title: { contains: q, mode: "insensitive" },
        },
        select: {
            title: true,
            images: true,
        },
    });

    return NextResponse.json({ products });
}