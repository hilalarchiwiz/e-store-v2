'use server'

import { PAGE_SIZE } from "@/lib/constant"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { signUp } from "@/lib/auth-client";
import { withPermission } from "@/lib/action-utils";
import { CreateUserSchema, UpdateUserSchema } from "../validations/user";

// 1. Get Roles (Simple list for dropdowns)
export async function getRoles() {
    return withPermission('user_view', async () => {
        const roles = await prisma.role.findMany({
            where: {
                name: {
                    notIn: ['user', 'Super Admin']
                }
            },
            select: {
                name: true,
                id: true,
            }
        });

        return { success: true, roles };
    });
}

// 2. Get Users (Paginated & Searchable)
export async function getUsers(searchParams: {
    search?: string;
    page?: string;
    limit?: string
}) {
    return withPermission('user_view', async () => {
        const query = searchParams.search || "";
        const currentPage = Number(searchParams.page) || 1;
        const itemsPerPage = Number(searchParams.limit) || PAGE_SIZE;
        const skip = (currentPage - 1) * itemsPerPage;

        const whereClause: any = {
            NOT: {
                roleName: 'Super Admin'
            }
        };

        if (query) {
            whereClause.AND = [
                {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' as const } },
                        { email: { contains: query, mode: 'insensitive' as const } },
                    ]
                }
            ];
        }

        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                where: whereClause,
                skip: skip,
                take: itemsPerPage,
                orderBy: { createdAt: 'desc' },
                include: { role: true }
            }),
            prisma.user.count({ where: whereClause })
        ]);

        return {
            success: true,
            users,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            totalCount: totalCount ?? 0
        };
    });
}

// 3. Create User (Better-Auth integration)
export async function createUser(prevData: any, formData: FormData) {
    return withPermission('user_create', async () => {
        const rawData = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            roleName: (formData.get('roleName') as string),
            password: formData.get('password') as string,
        };
        const validatedFields = CreateUserSchema.safeParse(rawData);

        if (!validatedFields.success) {
            const errors = validatedFields.error.flatten().fieldErrors;
            const firstErrorField = Object.keys(errors)[0];
            const firstErrorMessage = errors[firstErrorField][0];

            return {
                success: false,
                errors,
                message: firstErrorMessage,
            };
        }
        const { name, email, password, roleName } = validatedFields.data;
        const checkRole = await prisma.role.findFirst({
            where: { name: roleName }
        });
        if (!checkRole) {
            return {
                success: false,
                message: 'Role not found'
            }
        }
        const signUpResponse = await signUp.email({ name, email, password });

        if (!signUpResponse.data?.user?.id) {
            throw new Error(signUpResponse?.error?.message || "Failed to create user account.");
        }

        // Update the role after creation
        await prisma.user.update({
            where: { id: signUpResponse.data.user.id },
            data: { roleName }
        });

        revalidatePath('/admin/users');
        return { success: true, message: 'User created successfully' };
    });
}

// 4. Get User By ID
export async function getUserById(userId: string) {
    return withPermission('user_update', async () => {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) throw new Error("User not found");
        return { success: true, user };
    });
}

// 5. Update User
export async function updateUser(id: string | undefined, prevData: any, formData: FormData) {
    return withPermission('user_update', async () => {
        if (!id) throw new Error("User ID is required");

        const rawData = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            roleName: (formData.get('roleName') as string),
        }


        const validatedFields = UpdateUserSchema.safeParse(rawData);

        if (!validatedFields.success) {
            const errors = validatedFields.error.flatten().fieldErrors;
            const firstErrorField = Object.keys(errors)[0];
            const firstErrorMessage = errors[firstErrorField][0];
            return {
                success: false,
                errors,
                message: firstErrorMessage,
            };
        }

        const { name, email, roleName } = validatedFields.data;
        console.log(validatedFields.data)
        await prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                roleName,
                updatedAt: new Date(),
            }
        });

        revalidatePath('/admin/users');
        return { success: true, message: 'User updated successfully' };
    });
}

// 6. Delete User
export async function deleteUser(id: string) {
    return withPermission('user_delete', async () => {
        await prisma.user.delete({
            where: { id }
        });

        revalidatePath('/admin/users');
        return { success: true, message: 'User deleted successfully' };
    });
}