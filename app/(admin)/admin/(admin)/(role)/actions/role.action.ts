'use server'

import { PAGE_SIZE } from "@/lib/constant"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { withPermission } from "@/lib/action-utils"
import { RoleSchema } from "../validations/role"

// 1. Get All Roles
export async function getRoles(searchParams: {
    search?: string;
    page?: string;
    limit?: string
}) {
    return withPermission('role_view', async () => {
        const query = searchParams.search || "";
        const currentPage = Number(searchParams.page) || 1;
        const itemsPerPage = Number(searchParams.limit) || PAGE_SIZE;
        const skip = (currentPage - 1) * itemsPerPage;

        // 1. Build the WHERE clause to exclude 'user' and 'Super Admin'
        const whereClause = {
            name: {
                notIn: ['user', 'Super Admin'],
                ...(query && { contains: query, mode: 'insensitive' as const })
            }
        };

        const [roles, totalCount] = await Promise.all([
            prisma.role.findMany({
                where: whereClause,
                skip: skip,
                take: itemsPerPage,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.role.count({ where: whereClause })
        ]);

        return {
            success: true,
            roles,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            totalCount: totalCount ?? 0
        };
    });
}

// 2. Create Role
export async function createRole(prevData: any, formData: FormData) {
    return withPermission('role_create', async () => {
        const rawData = {
            name: formData.get('name') as string,
            modules: formData.getAll('modules') as string[],
            permissions: formData.getAll('permissions') as string[],
        };

        const validatedFields = RoleSchema.safeParse(rawData);

        if (!validatedFields.success) {
            const errors = validatedFields.error.flatten().fieldErrors;
            // Get first error only
            const firstErrorField = Object.keys(errors)[0];
            const firstErrorMessage = errors[firstErrorField][0];

            return {
                success: false,
                errors,
                message: firstErrorMessage,
            };
        }
        const { name, modules, permissions } = validatedFields.data;
        await prisma.role.create({
            data: {
                name,
                modules,
                permissions,
            }
        });

        revalidatePath('/admin/role');
        return {
            success: true,
            message: 'Role created successfully'
        };
    });
}

// 3. Get Role By ID
export async function getRoleById(roleId: string) {
    return withPermission('role_update', async () => {
        if (!roleId) throw new Error("Role ID is required");

        const role = await prisma.role.findUnique({
            where: {
                id: Number(roleId)
            }
        });

        if (!role) throw new Error("Role not found some thing went to wrong");

        return {
            success: true,
            role
        };
    });
}

// 4. Update Role
export async function updateRole(id: number | undefined, prevData: any, formData: FormData) {
    return withPermission('role_update', async () => {
        if (!id) throw new Error("Role ID is required for update");

        const rawData = {
            name: formData.get('name') as string,
            modules: formData.getAll('modules') as string[],
            permissions: formData.getAll('permissions') as string[],
        };
        const validatedFields = RoleSchema.safeParse(rawData);

        if (!validatedFields.success) {
            const errors = validatedFields.error.flatten().fieldErrors;
            // Get first error only
            const firstErrorField = Object.keys(errors)[0];
            const firstErrorMessage = errors[firstErrorField][0];

            return {
                success: false,
                errors,
                message: firstErrorMessage,
            };
        }
        await prisma.role.update({
            where: { id },
            // data: {
            //     name,
            //     modules,
            //     permissions,
            // }
            data: validatedFields.data
        });

        revalidatePath('/admin/role');
        return {
            success: true,
            message: 'Role updated successfully'
        };
    });
}

// 5. Delete Role
export async function deleteRole(roleId: string) {
    return withPermission('role_delete', async () => {
        if (!roleId) throw new Error("Role ID is required");

        await prisma.role.delete({
            where: {
                id: Number(roleId)
            }
        });

        revalidatePath('/admin/role');

        return {
            success: true, // Fixed: was returning false in your original code
            message: 'Role deleted successfully'
        };
    });
}