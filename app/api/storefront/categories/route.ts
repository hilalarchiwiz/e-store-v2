import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getStorefrontProductFilter } from "@/lib/storefront-products";

function publicUrl(value: string | null, request: NextRequest): string | null {
  if (!value) return null;
  try {
    return new URL(value, request.nextUrl.origin).toString();
  } catch {
    return null;
  }
}

/** Active categories containing storefront-visible products. */
export async function GET(request: NextRequest) {
  try {
    const productFilter = await getStorefrontProductFilter();
    const records = await prisma.category.findMany({
      where: { status: "active", products: { some: productFilter } },
      orderBy: [{ order_number: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        img: true,
        _count: { select: { products: { where: productFilter } } },
      },
    });

    const categories = records.map((category) => ({
      id: category.id,
      name: category.title,
      slug: category.slug,
      image: publicUrl(category.img, request),
      productCount: category._count.products,
    }));

    return NextResponse.json(
      { categories },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" } },
    );
  } catch (error) {
    console.error("Failed to load storefront categories", error);
    return NextResponse.json({ error: "Unable to load categories" }, { status: 500 });
  }
}
