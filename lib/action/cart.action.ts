'use server';

import prisma from '@/lib/prisma';
import { getOrCreateAnonymousId } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function addToCart(productId: number, quantity: number) {
  try {
    const anonymousId = await getOrCreateAnonymousId();

    // Check product stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { quantity: true, title: true },
    });
    if (!product) return { success: false, error: "Product not found" };
    if (product.quantity <= 0) return { success: false, error: "This product is out of stock" };

    const existingItem = await prisma.cart.findFirst({
      where: { productId, anonymousId },
    });

    const currentCartQty = existingItem?.quantity ?? 0;
    const newTotal = currentCartQty + quantity;

    if (newTotal > product.quantity) {
      const available = product.quantity - currentCartQty;
      if (available <= 0) {
        return { success: false, error: `You already have the maximum available stock (${product.quantity}) in your cart` };
      }
      return { success: false, error: `Only ${available} more unit${available === 1 ? "" : "s"} available (stock: ${product.quantity})` };
    }

    if (existingItem) {
      await prisma.cart.update({
        where: { id: existingItem.id },
        data: { quantity: newTotal },
      });
    } else {
      await prisma.cart.create({
        data: { productId, quantity, anonymousId },
      });
    }

    revalidatePath('/v2/cart');
    revalidatePath('/v2/shop');
    return { success: true };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, error: "Failed to add to cart" };
  }
}

export async function removeFromCart(cartId: string) {
  try {
    await prisma.cart.delete({
      where: { id: cartId },
    });
    revalidatePath('/v2/cart');
    return { success: true };
  } catch (error) {
    console.error("Error removing from cart:", error);
    return { success: false, error: "Failed to remove from cart" };
  }
}

export async function updateCartQuantity(cartId: string, quantity: number) {
  try {
    if (quantity <= 0) {
      return removeFromCart(cartId);
    }

    // Check product stock
    const cartItem = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { product: { select: { quantity: true } } },
    });
    if (!cartItem) return { success: false, error: "Cart item not found" };

    if (quantity > cartItem.product.quantity) {
      return {
        success: false,
        error: `Only ${cartItem.product.quantity} unit${cartItem.product.quantity === 1 ? "" : "s"} in stock`,
      };
    }

    await prisma.cart.update({
      where: { id: cartId },
      data: { quantity },
    });
    revalidatePath('/v2/cart');
    return { success: true };
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return { success: false, error: "Failed to update cart quantity" };
  }
}

export async function getCart() {
  try {
    const anonymousId = await getOrCreateAnonymousId();
    const cartItems = await prisma.cart.findMany({
      where: { anonymousId },
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return cartItems;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  }
}
