import { NextResponse } from "next/server";
import { hasPermission } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    const headers = { "Cache-Control": "no-store" };
    if (!await hasPermission("order_view")) {
        return NextResponse.json({ success: false }, { status: 403, headers });
    }
    try {
        const count = await prisma.order.count({ where: { status: "PENDING" } });
        return NextResponse.json({ success: true, count }, { headers });
    } catch {
        return NextResponse.json({ success: false }, { status: 500, headers });
    }
}
