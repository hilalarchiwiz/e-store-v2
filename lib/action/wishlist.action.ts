'use server';

import prisma from '@/lib/prisma';
import { getOrCreateAnonymousId } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function addToWishlist(productId: number) {
  try {
    const anonymousId = await getOrCreateAnonymousId();

    const existing = await prisma.wishlist.findFirst({
      where: {
        productId,
        anonymousId,
      },
    });

    if (!existing) {
      await prisma.wishlist.create({
        data: {
          productId,
          anonymousId,
        },
      });
    }

    revalidatePath('//wishlist');
    revalidatePath('//shop');
    return { success: true };
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return { success: false, error: "Failed to add to wishlist" };
  }
}

export async function removeFromWishlist(wishlistId: number) {
  try {
    await prisma.wishlist.delete({
      where: { id: wishlistId },
    });
    revalidatePath('//wishlist');
    return { success: true };
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return { success: false, error: "Failed to remove from wishlist" };
  }
}

export async function removeFromWishlistByProductId(productId: number) {
  try {
    const anonymousId = await getOrCreateAnonymousId();
    await prisma.wishlist.deleteMany({
      where: { productId, anonymousId },
    });
    revalidatePath('//wishlist');
    revalidatePath('//shop');
    return { success: true };
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return { success: false, error: "Failed to remove from wishlist" };
  }
}

export async function getWishlist() {
  try {
    const anonymousId = await getOrCreateAnonymousId();
    const items = await prisma.wishlist.findMany({
      where: { anonymousId },
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return items;
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
}

export async function getWishlistProductIds() {
  try {
    const anonymousId = await getOrCreateAnonymousId();
    const items = await prisma.wishlist.findMany({
      where: { anonymousId },
      select: { productId: true }
    });
    return items.map(i => i.productId);
  } catch (error) {
    console.error("Error fetching wishlist IDs:", error);
    return [];
  }
}
