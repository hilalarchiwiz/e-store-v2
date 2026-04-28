'use server'

import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function createLoginLog(userId: string) {
    try {
        const headerList = await headers();
        const ip = headerList.get('x-forwarded-for') || "unknown";
        const ua = headerList.get('user-agent') || "unknown";

        await prisma.loginLog.create({
            data: {
                userId,
                ipAddress: ip,
                userAgent: ua,
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to create login log:", error);
        return { success: false };
    }
}