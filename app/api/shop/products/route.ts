import { NextRequest, NextResponse } from "next/server";
import { getShopProducts } from "@/lib/shop-products";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const offset = Number(params.get("offset"));
  if (!Number.isSafeInteger(offset) || offset < 0) {
    return NextResponse.json({ error: "Invalid offset" }, { status: 400 });
  }
  try {
    const { products, totalProducts } = await getShopProducts(
      Object.fromEntries(params), offset, 50,
    );
    return NextResponse.json({ products, totalProducts });
  } catch (error) {
    console.error("Failed to load shop products", error);
    return NextResponse.json({ error: "Unable to load products" }, { status: 500 });
  }
}
