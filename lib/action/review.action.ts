'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface CreateReviewData {
  productId: number;
  rating: number;
  comment: string;
  name: string;
  email: string;
}

export async function createReview(data: CreateReviewData) {
  try {
    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        rating: data.rating,
        comment: data.comment,
        name: data.name,
        email: data.email,
        // For now, we are allowing anonymous reviews or reviews without login
        // If logged in, we should pass userId. But based on the schema, name/email are explicit fields
      }
    });

    revalidatePath(`/product/${data.productId}`);
    return { success: true, review };
  } catch (error) {
    console.error("Error creating review:", error);
    return { success: false, error: "Failed to submit review" };
  }
}

export async function getLatestReviews(limit: number = 8) {
  try {
    return await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        rating: true,
        comment: true,
        createdAt: true,
        product: { select: { title: true } },
      },
    });
  } catch {
    return [];
  }
}
