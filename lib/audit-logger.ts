import prisma from "@/lib/prisma";

export async function logChange({
    entityName,
    entityId,
    action,
    oldData,
    newData,
    userId
}: {
    entityName: string;
    entityId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    oldData?: any;
    newData?: any;
    userId: string;
}) {
    return await prisma.auditLog.create({
        data: {
            entityName,
            entityId,
            action,
            oldData: oldData || null,
            newData: newData || null,
            changedBy: userId,
        }
    });
}