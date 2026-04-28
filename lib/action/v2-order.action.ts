"use server";

import prisma from "@/lib/prisma";
import generateSession from "@/lib/generate-session";
import { getOrCreateAnonymousId } from "@/lib/session";
import { discountPrice } from "@/lib/helper";
import { revalidatePath } from "next/cache";

export interface AddressInput {
  firstName: string;
  lastName: string;
  company?: string;
  country: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state?: string;
  phone: string;
  email: string;
}

export interface PlaceOrderInput {
  addressId?: string;
  addressData?: AddressInput;
  shippingMethod: "FREE" | "FEDEX" | "DHL";
  paymentMethod: "CASH_ON_DELIVERY" | "BANK_TRANSFER";
  couponCode?: string;
  notes?: string;
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

function getShippingFee(method: string): number {
  switch (method) {
    case "FREE": return 0;
    case "FEDEX": return 10.99;
    case "DHL": return 12.5;
    default: return 0;
  }
}

export async function placeOrder(input: PlaceOrderInput) {
  try {
    const session = await generateSession();
    if (!session?.user) {
      return { success: false, error: "Please log in to place an order" };
    }
    const userId = session.user.id;

    const anonymousId = await getOrCreateAnonymousId();
    const cartItems = await prisma.cart.findMany({
      where: { anonymousId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return { success: false, error: "Your cart is empty" };
    }

    // Check stock
    for (const item of cartItems) {
      if (item.product.quantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${item.product.title}" (only ${item.product.quantity} available)`,
        };
      }
    }

    // Calculate subtotal
    let subtotal = 0;
    const orderItemsData = cartItems.map((item) => {
      const finalPrice = item.product.discountedPrice
        ? discountPrice({ price: item.product.price, discount: item.product.discountedPrice })
        : item.product.price;
      const itemSubtotal = finalPrice * item.quantity;
      subtotal += itemSubtotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
        subtotal: itemSubtotal,
      };
    });

    // Validate coupon
    let discount = 0;
    let validCoupon: any = null;
    if (input.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: input.couponCode.toUpperCase() },
      });
      if (!coupon || !coupon.isActive) {
        return { success: false, error: "Invalid coupon code" };
      }
      if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        return { success: false, error: "Coupon has expired" };
      }
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return { success: false, error: "Coupon usage limit reached" };
      }
      if (coupon.minPurchase && subtotal < coupon.minPurchase) {
        return { success: false, error: `Minimum purchase of $${coupon.minPurchase} required` };
      }
      if (coupon.discountType === "PERCENTAGE") {
        discount = (subtotal * coupon.discount) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = coupon.discount;
      }
      validCoupon = coupon;
    }

    const shippingFee = getShippingFee(input.shippingMethod);
    const total = subtotal + shippingFee - discount;

    const order = await prisma.$transaction(async (tx) => {
      let billingAddressId: string;

      if (input.addressId) {
        const addr = await tx.address.findFirst({
          where: { id: input.addressId, userId },
        });
        if (!addr) throw new Error("Selected address not found");
        billingAddressId = addr.id;
      } else if (input.addressData) {
        const newAddr = await tx.address.create({
          data: { userId, ...input.addressData },
        });
        billingAddressId = newAddr.id;
      } else {
        throw new Error("Please provide a shipping address");
      }

      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          billingAddressId,
          shippingAddressId: billingAddressId,
          shipToDifferentAddress: false,
          subtotal,
          shippingFee,
          discount,
          total,
          paymentMethod: input.paymentMethod,
          shippingMethod: input.shippingMethod,
          couponCode: input.couponCode?.toUpperCase(),
          notes: input.notes,
          status: "PENDING",
          paymentStatus: "PENDING",
        },
      });

      await tx.orderItem.createMany({
        data: orderItemsData.map((item) => ({ ...item, orderId: newOrder.id })),
      });

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      if (validCoupon) {
        await tx.coupon.update({
          where: { id: validCoupon.id },
          data: { usageCount: { increment: 1 } },
        });
      }

      await tx.cart.deleteMany({ where: { anonymousId } });

      return newOrder;
    });

    revalidatePath("/v2/cart");
    revalidatePath("/v2/checkout");
    revalidatePath("/v2/dashboard/orders");

    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (error: any) {
    console.error("Checkout error:", error);
    return { success: false, error: error.message || "Failed to place order. Please try again." };
  }
}

export async function validateCouponCode(code: string, subtotal: number) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!coupon || !coupon.isActive) return { valid: false, discount: 0, message: "Invalid coupon code" };
    if (coupon.expiresAt && new Date() > coupon.expiresAt) return { valid: false, discount: 0, message: "Coupon has expired" };
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return { valid: false, discount: 0, message: "Coupon usage limit reached" };
    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      return { valid: false, discount: 0, message: `Minimum purchase of $${coupon.minPurchase} required` };
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (subtotal * coupon.discount) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
    } else {
      discount = coupon.discount;
    }

    return { valid: true, discount, message: `Coupon applied! You save $${discount.toFixed(2)}` };
  } catch {
    return { valid: false, discount: 0, message: "Failed to validate coupon" };
  }
}

export async function getOrders() {
  try {
    const session = await generateSession();
    if (!session?.user) return { success: false, orders: [] as any[] };

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        orderItems: {
          include: { product: { select: { id: true, title: true, images: true } } },
        },
        billingAddress: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, orders };
  } catch (error) {
    console.error("Get orders error:", error);
    return { success: false, orders: [] as any[] };
  }
}

export async function getOrderByNumber(orderNumber: string) {
  try {
    const session = await generateSession();
    if (!session?.user) return { success: false, order: null };

    const order = await prisma.order.findFirst({
      where: { orderNumber, userId: session.user.id },
      include: {
        orderItems: {
          include: { product: { select: { id: true, title: true, images: true, price: true } } },
        },
        billingAddress: true,
        shippingAddress: true,
      },
    });

    if (!order) return { success: false, order: null, error: "Order not found" };
    return { success: true, order };
  } catch (error) {
    console.error("Get order error:", error);
    return { success: false, order: null };
  }
}
