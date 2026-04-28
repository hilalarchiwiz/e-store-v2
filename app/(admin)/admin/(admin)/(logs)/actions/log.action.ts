import { withPermission } from "@/lib/action-utils";
import { PAGE_SIZE } from "@/lib/constant";
import prisma from "@/lib/prisma";

export async function getAuditLogs(searchParams: {
    search?: string;
    page?: string;
    limit?: string
}) {
    // 1. Permission Check (using your super_admin check)
    return await withPermission('audit_view', async () => {
        const query = searchParams.search || "";
        const currentPage = Number(searchParams.page) || 1;
        const itemsPerPage = Number(searchParams.limit) || 10;
        const skip = (currentPage - 1) * itemsPerPage;

        // 2. Define the WHERE clause for search
        const whereClause = query ? {
            OR: [
                { entityName: { contains: query, mode: 'insensitive' as const } },
                { action: { contains: query, mode: 'insensitive' as const } },
                { entityId: { contains: query } }
            ]
        } : {};

        // 3. Fetch logs and total count
        const [logs, totalCount] = await Promise.all([
            prisma.auditLog.findMany({
                where: whereClause,
                skip: skip,
                take: itemsPerPage,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.auditLog.count({ where: whereClause })
        ]);

        // 4. Manually fetch users since there is no direct relation in Schema
        const userIds = [...new Set(logs.map(log => log.changedBy))];
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true }
        });

        // 5. Merge user data into logs
        const logsWithUsers = logs.map(log => ({
            ...log,
            user: users.find(u => u.id === log.changedBy) || {
                name: "System",
                email: "auto@system.com"
            }
        }));

        return {
            success: true,
            logs: logsWithUsers,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            totalCount: totalCount ?? 0
        };
    });
}

export async function getLoginLogs(searchParams: {
    search?: string;
    page?: string;
    limit?: string
}) {
    return await withPermission('login_view', async () => {
        const query = searchParams.search || "";
        const currentPage = Number(searchParams.page) || 1;
        const itemsPerPage = Number(searchParams.limit) || PAGE_SIZE;
        const skip = (currentPage - 1) * itemsPerPage;
        const [logs, totalCount] = await Promise.all([
            prisma.loginLog.findMany({
                // where: whereClause,
                skip: skip,
                take: itemsPerPage,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: true
                }
            }),
            prisma.loginLog.count()
        ]);

        return {
            success: true,
            logs,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            totalCount: totalCount ?? 0
        };
    });
}