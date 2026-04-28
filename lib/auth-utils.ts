'use server';
import prisma from "@/lib/prisma";
import generateSession from "./generate-session";

export async function hasPermission(
    permission: string | string[]
) {
    const session = await generateSession();
    if (!session?.user) return false;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true }
    });

    if (!user?.role) return false;
    const requiredPermissions = Array.isArray(permission) ? permission : [permission];
    const userPermissions = user.role.permissions || [];

    return requiredPermissions.some(p => userPermissions.includes(p));
}