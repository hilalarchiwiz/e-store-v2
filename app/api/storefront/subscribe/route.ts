import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const email = body && typeof body === "object" && "email" in body && typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!EMAIL.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    const existing = await prisma.subscribe.findFirst({ where: { email } });
    if (existing) return NextResponse.json({ error: "This email is already subscribed." }, { status: 409 });
    await prisma.subscribe.create({ data: { email } });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Mobile subscription failed", error);
    return NextResponse.json({ error: "Unable to subscribe right now." }, { status: 500 });
  }
}
