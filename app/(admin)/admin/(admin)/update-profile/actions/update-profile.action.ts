'use server'

import bcrypt from 'bcryptjs';
import { deleteMultipleImages, uploadImage } from "@/lib/action/FileUpload";
import generateSession from "@/lib/generate-session";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function updateProfile(prevData: any, formData: FormData) {
    try {
        const session = await generateSession();
        if (!session?.user) throw new Error("Unauthorized");

        const name = formData.get('name') as string;
        const image = formData.get('image') as string;

        let imageUrl = '';
        const imageFile = formData.get('image');
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { image: true }
        });
        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            const imageUrlResponse = await uploadImage(formData);
            if (imageUrlResponse.error) throw new Error(`Image upload failed: ${imageUrlResponse.error}`);
            // Cleanup old image if it changed and isn't the dummy
            if (currentUser?.image && currentUser.image !== image && !currentUser.image.includes('dummy')) {
                await deleteMultipleImages([currentUser.image]);
            }
            imageUrl = imageUrlResponse.url || '';
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { name, image: imageUrl ? imageUrl : currentUser?.image }
        });

        revalidatePath('/');
        return { success: true, message: 'Profile updated successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function changePassword(prevData: any, formData: FormData) {
    try {
        const session = await generateSession()
        if (!session?.user) throw new Error("Unauthorized");

        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (newPassword !== confirmPassword) {
            return {
                success: false,
                message: "New password and confirm password do not match"
            }
        }

        if (newPassword.length < 8) {
            return {
                success: false,
                message: "Password must be at least 8 characters long"
            }
        }

        // 1. Fetch the user's account to get the current hashed password
        const account = await prisma.account.findFirst({
            where: {
                userId: session.user.id,
                providerId: "credential"
            }
        });

        if (!account || !account.password) {
            return {
                success: false,
                message: "Account not found or password not set"
            }
        }

        const data = await auth.api.changePassword({
            body: {
                newPassword: newPassword, // required
                currentPassword: currentPassword, // required
                revokeOtherSessions: true,
            },
            headers: await headers(),
        });
        return { success: true, message: "Password updated successfully" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}