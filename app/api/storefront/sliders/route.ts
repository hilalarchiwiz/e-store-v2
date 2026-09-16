import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function publicUrl(value: string, request: NextRequest): string | null {
  try {
    return new URL(value, request.nextUrl.origin).toString();
  } catch {
    return null;
  }
}

/** Active admin-managed hero slides for web and mobile storefront clients. */
export async function GET(request: NextRequest) {
  try {
    const records = await prisma.slider.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true, description: true, img: true, link: true },
    });

    const sliders = records.flatMap((slider) => {
      const image = publicUrl(slider.img, request);
      if (!image) return [];
      return [{
        id: slider.id,
        title: slider.title,
        description: slider.description,
        link: slider.link,
        image,
      }];
    });

    return NextResponse.json(
      { sliders },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" } },
    );
  } catch (error) {
    console.error("Failed to load storefront sliders", error);
    return NextResponse.json({ error: "Unable to load sliders" }, { status: 500 });
  }
}
