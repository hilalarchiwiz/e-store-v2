'use server'

import { uploadImage } from "@/lib/action/FileUpload"
import { PAGE_SIZE } from "@/lib/constant"
import prisma from "@/lib/prisma"
import { BrandStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from 'zod';

export type ActionState = {
    success: boolean;
    message: string;
    errors?: {
        title?: string[];
        description?: string[];
    };
};


export type BrandResponse = {
    success: boolean,
    message: string,
    brands?: any
}

export async function getWhatWeDo(searchParams: { search?: string; page?: string; limit?: string }, type: string) {
    try {
        const query = searchParams.search || "";
        const currentPage = Number(searchParams.page) || 1;
        const itemsPerPage = Number(searchParams.limit) || 10; // Default limit
        const skip = (currentPage - 1) * itemsPerPage;

        // Construct a robust where clause
        const whereClause = {
            AND: [
                { type: type }, // Always filter by the specific page/category type
                query ? {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' as const } },
                        { description: { contains: query, mode: 'insensitive' as const } }
                    ]
                } : {}
            ]
        };

        const [whatwedoes, totalCount] = await Promise.all([
            prisma.whatWeDo.findMany({
                where: whereClause as any,
                skip: skip,
                take: itemsPerPage,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.whatWeDo.count({ where: whereClause as any })
        ]);

        return {
            success: true,
            whatwedoes,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            totalCount: totalCount ?? 0
        };
    } catch (err) {
        const error = err as Error;
        console.error('Error fetching WhatWeDo:', error);
        return {
            success: false,
            message: error.message || 'An unknown error occurred.',
        };
    }
}

export async function createWhatWeDo(prevData: any, formData: FormData) {

    try {
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const icon = formData.get('icon') as string;
        const type = formData.get('type') as string;

        await prisma.whatWeDo.create({
            data: {
                title,
                icon,
                type,
                description
            }
        });

        revalidatePath('/admin/about/what-we-do');
        revalidatePath('/about');
        return {
            success: true,
            message: 'What we do created successfully'
        }

    } catch (err) {
        if (err && typeof err === 'object' && 'digest' in err && typeof err.digest === 'string' && err.digest.includes('NEXT_REDIRECT')) {
            throw err;
        }

        const error = err as Error | { message: string };
        console.error('Error creating brand:', error);

        return {
            success: false,
            message: error.message || 'An unknown error occurred while creating brand.',
        };
    }

}

export async function getWhatWeDoById(id: string) {
    try {
        const whatwedo = await prisma.whatWeDo.findUnique({
            where: {
                id: Number(id)
            }
        });
        return {
            success: true,
            whatwedo
        };
    } catch (err) {
        console.error('Error fetching brand by ID:', err);
        return null;
    }
}

export async function updateWhatWeDo(id: number | undefined, prevData: any, formData: FormData) {
    try {
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const icon = formData.get('icon') as string;

        const updateData: any = {
            title,
            description,
            icon
        };
        await prisma.whatWeDo.update({
            where: {
                id: id
            },
            data: updateData
        });
        revalidatePath('/admin/about/what-we-do');
        revalidatePath('/');

        return {
            success: true,
            message: 'What we do updated successfully'
        }

    } catch (err) {
        if (err && typeof err === 'object' && 'digest' in err && typeof err.digest === 'string' && err.digest.includes('NEXT_REDIRECT')) {
            throw err;
        }

        const error = err as Error | { message: string };
        console.error('Error updating brand:', error);

        return {
            success: false,
            message: error.message || 'An unknown error occurred while updating brand.',
        };
    }


}

export async function deleteWhatWeDo(id: string): Promise<void | BrandResponse> {
    try {
        await prisma.whatWeDo.delete({
            where: {
                id: Number(id)
            }
        });
        revalidatePath('/admin/about/what-we-do')
        revalidatePath('/')
        return {
            success: true,
            message: 'WhatWedo deleted successfully',
        }
    } catch (err) {
        const error = err as Error | { message: string }
        console.error('Error deleting brand:', error) // Log the error for debugging
        return {
            success: false,
            message: error.message || 'An unknown error occurred while deleting the brand.',
        }
    }
}