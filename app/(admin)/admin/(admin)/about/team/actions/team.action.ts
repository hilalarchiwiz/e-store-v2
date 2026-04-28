'use server'

import { uploadImage } from "@/lib/action/FileUpload"
import { PAGE_SIZE } from "@/lib/constant"
import prisma from "@/lib/prisma"
import { BrandStatus } from "@prisma/client"
import { error } from "console"
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

export async function getTeams(searchParams: { search?: string; page?: string; limit?: string }) {
    try {
        const query = searchParams.search || "";
        const currentPage = Number(searchParams.page) || 1;
        const itemsPerPage = Number(searchParams.limit) || 10; // Default limit
        const skip = (currentPage - 1) * itemsPerPage;

        // Construct a robust where clause
        const whereClause = query ? {
            name: { contains: query, mode: 'insensitive' as const },
            designation: { contains: query, mode: 'insensitive' as const },
            description: { contains: query, mode: 'insensitive' as const }
        } : {}

        const [teams, totalCount] = await Promise.all([
            prisma.team.findMany({
                where: whereClause as any,
                skip: skip,
                take: itemsPerPage,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.team.count({ where: whereClause as any })
        ]);

        return {
            success: true,
            teams,
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

export async function createTeam(prevData: any, formData: FormData) {

    try {
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const designation = formData.get('designation') as string;

        const imageUrlResponse = await uploadImage(formData);

        if (!imageUrlResponse.success) {
            return {
                success: false,
                message: `Image upload failed: ${imageUrlResponse.success}`
            };
        }

        const imageUrl = imageUrlResponse.url || '';

        await prisma.team.create({
            data: {
                name,
                designation,
                image: imageUrl,
                description
            }
        });

        revalidatePath('/admin/about/team');
        revalidatePath('/about');
        return {
            success: true,
            message: 'Team created successfully'
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

export async function getTeamById(id: string) {
    try {
        const team = await prisma.team.findUnique({
            where: {
                id: Number(id)
            }
        });
        return {
            success: true,
            team
        };
    } catch (err) {
        const error = err as Error | { message: string }
        console.error('Error fetching brand by ID:', err);
        return {
            success: false,
            message: error.message
        }
    }
}

export async function updateTeam(id: number | undefined, prevData: any, formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const designation = formData.get('designation') as string;

        let imageUrl = '';
        const imageFile = formData.get('image');
        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            const imageUrlResponse = await uploadImage(formData);
            if (!imageUrlResponse.success) {
                return {
                    success: false,
                    message: `Image upload failed: ${imageUrlResponse.success}`
                };
            }
            imageUrl = imageUrlResponse.url || '';
        }
        const updateData: any = {
            name,
            description,
            designation
        };
        if (imageUrl) {
            updateData.image = imageUrl;
        }
        await prisma.team.update({
            where: {
                id: id
            },
            data: updateData
        });
        revalidatePath('/admin/about/team');
        revalidatePath('/');

        return {
            success: true,
            message: 'team updated successfully'
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

export async function deleteTeam(id: string): Promise<void | BrandResponse> {
    try {
        await prisma.team.delete({
            where: {
                id: Number(id)
            }
        });
        revalidatePath('/admin/about/team')
        return {
            success: true,
            message: 'team deleted successfully',
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