"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "../prisma";
import { discountPrice } from "../helper";
import generateSession from "../generate-session";
import { createPayFastPayload } from "../payfast";
import { initiateAPS } from "../payments/aps";

// Types
interface BillingAddressInput {
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

interface CheckoutInput {
    userId: string;
    billingAddress: BillingAddressInput;
    shippingAddress?: BillingAddressInput;
    shipToDifferentAddress: boolean;
    cartItems: Array<{ productId: string; quantity: number }>;
    paymentMethod: "CASH_ON_DELIVERY" | "BANK_TRANSFER" | "PAYPAL" | "CREDIT_CARD";
    shippingMethod: "FREE" | "FEDEX" | "DHL";
    couponCode?: string;
    notes?: string;
}

// Generate unique order number
function generateOrderNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `ORD-${timestamp}-${random}`.toUpperCase();
}

// Validate coupon code
async function validateCoupon(code: string, subtotal: number) {
    const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
        return { valid: false, discount: 0, message: "Invalid coupon code" };
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        return { valid: false, discount: 0, message: "Coupon has expired" };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return { valid: false, discount: 0, message: "Coupon usage limit reached" };
    }

    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
        return {
            valid: false,
            discount: 0,
            message: `Minimum purchase of $${coupon.minPurchase} required`,
        };
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
        discount = (subtotal * coupon.discount) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
        }
    } else {
        discount = coupon.discount;
    }

    return { valid: true, discount, coupon };
}

// Calculate shipping fee
function calculateShippingFee(method: string): number {
    switch (method) {
        case "FREE":
            return 0;
        case "FEDEX":
            return 10.99;
        case "DHL":
            return 12.5;
        default:
            return 0;
    }
}

// Main checkout action
export async function processCheckout(input: CheckoutInput) {
    try {
        // Validate user
        const user = await prisma.user.findUnique({
            where: { id: input.userId },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Validate and get products
        const products = await prisma.product.findMany({
            where: {
                id: { in: input.cartItems.map((item: any) => item.productId) },
            },
        });

        if (products.length !== input.cartItems.length) {
            return { success: false, error: "Some products not found" };
        }

        // Check stock availability
        for (const cartItem of input.cartItems) {
            const product = products.find((p: any) => p.id === cartItem.productId);
            if (!product || product.quantity < cartItem.quantity) {
                return {
                    success: false,
                    error: `Insufficient stock for ${product?.title || "product"} its quantity ${product?.quantity}`,
                };
            }
        }

        // Calculate subtotal
        let subtotal = 0;
        const orderItemsData = input.cartItems.map((cartItem) => {
            const product = products.find((p: any) => p.id === cartItem.productId)!;
            const itemSubtotal = discountPrice({
                price: product.price,
                discount: product?.discountedPrice
            }) * cartItem.quantity;
            subtotal += itemSubtotal;

            return {
                productId: product.id,
                quantity: cartItem.quantity,
                price: product.price,
                subtotal: itemSubtotal,
            };
        });

        // Validate coupon if provided
        let discount = 0;
        let validCoupon = null;
        if (input.couponCode) {
            const couponResult = await validateCoupon(input.couponCode, subtotal);
            if (!couponResult.valid) {
                return { success: false, error: couponResult.message };
            }
            discount = couponResult.discount;
            validCoupon = couponResult.coupon;
        }

        // Calculate shipping fee
        const shippingFee = calculateShippingFee(input.shippingMethod);

        // Calculate total
        const total = subtotal + shippingFee - discount;

        // Create order with transaction
        const order = await prisma.$transaction(async (tx) => {
            // Create or get billing address
            const billingAddress = await tx.address.create({
                data: {
                    userId: input.userId,
                    ...input.billingAddress,
                },
            });

            // Create or get shipping address
            let shippingAddress = billingAddress;
            if (input.shipToDifferentAddress && input.shippingAddress) {
                shippingAddress = await tx.address.create({
                    data: {
                        userId: input.userId,
                        ...input.shippingAddress,
                    },
                });
            }

            // Create order
            const newOrder = await tx.order.create({
                data: {
                    orderNumber: generateOrderNumber(),
                    userId: input.userId,
                    billingAddressId: billingAddress.id,
                    shippingAddressId: shippingAddress.id,
                    shipToDifferentAddress: input.shipToDifferentAddress,
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

            // Create order items
            await tx.orderItem.createMany({
                data: orderItemsData.map((item) => ({
                    ...item,
                    orderId: newOrder.id,
                })),
            });

            // Update product stock
            for (const cartItem of input.cartItems) {
                await tx.product.update({
                    where: { id: Number(cartItem.productId) },
                    data: {
                        quantity: {
                            decrement: cartItem.quantity,
                        },
                    },
                });
            }

            // Update coupon usage if applied
            if (validCoupon) {
                await tx.coupon.update({
                    where: { id: validCoupon.id },
                    data: {
                        usageCount: {
                            increment: 1,
                        },
                    },
                });
            }

            // Clear user's cart
            await tx.cart.deleteMany({
                where: {
                    userId: input.userId,
                    productId: { in: input.cartItems.map((item: any) => item.productId) },
                },
            });

            return newOrder;
        });

        let checkoutUrl;
        let data;
        // if (input.paymentMethod === "CREDIT_CARD") {
        //     // const isSandbox = process.env.NODE_ENV !== 'production';
        //     // const baseUrl = isSandbox ? "https://sandbox.api.getsafepay.com" : "https://api.getsafepay.com";
        //     const baseUrl = "https://sandbox.api.getsafepay.com"
        //     const response = await fetch(`${baseUrl}/order/v1/init`, {
        //         method: "POST",
        //         headers: { "Content-Type": "application/json" },
        //         body: JSON.stringify({
        //             client: process.env.SAFEPAY_PUBLIC_KEY, // Your Public API Key
        //             amount: Math.round(total),
        //             currency: "PKR",
        //             // environment: isSandbox ? "sandbox" : "production",
        //             environment: "sandbox"

        //         }),
        //     });

        //     result = await response.json();
        //     console.log(result);
        //     if (result.status.message === "success") {
        //         const checkoutBaseUrl = "https://sandbox.api.getsafepay.com/components/complete"
        //         // : "https://www.getsafepay.com/components";
        //         // const checkoutBaseUrl = isSandbox
        //         //     ? "https://sandbox.api.getsafepay.com/components"
        //         //     : "https://www.getsafepay.com/components";

        //         const params = new URLSearchParams({
        //             env: "sandbox",
        //             beacon: result.data.token,
        //             source: 'e-store',
        //             order_id: order.orderNumber,
        //             redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/checkout/confirm`,
        //             cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`
        //         });
        //         checkoutUrl = `${checkoutBaseUrl}?${params.toString()}`
        //     }
        // }

        // if (input.paymentMethod === "CREDIT_CARD") {
        //     // const res = await fetch("/api/payfast/init", {
        //     //     method: "POST",
        //     //     headers: { "Content-Type": "application/json" },
        //     //     body: JSON.stringify({
        //     //         amount: total,
        //     //         order_id: order.orderNumber
        //     //     })
        //     // });

        //     // data = await res.json();
        //     data = await initiateAPS({
        //         orderNumber: order.orderNumber,
        //         total: order.total
        //     });
        // }

        revalidatePath("/cart");
        revalidatePath("/orders");
        return {
            success: true,
            orderId: order.id,
            orderNumber: order.orderNumber,
            // paymentUrl: checkoutUrl,
            // input,
            // data
        };
    } catch (error) {
        console.error("Checkout error:", error);
        return {
            success: false,
            error: "Failed to process checkout. Please try again.",
        };
    }
}

// Get user's cart items
export async function getCartItems(userId: string | undefined) {
    try {
        const cartItems = await prisma.cart.findMany({
            where: { userId },
            include: {
                product: true,
            },
        });

        return { success: true, cartItems };
    } catch (error) {
        console.error("Get cart error:", error);
        return { success: false, error: "Failed to fetch cart items" };
    }
}

// Add to cart
export async function addToCart(userId: string, productId: string, quantity: number = 1) {
    try {
        // Check if product exists and has stock
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return { success: false, error: "Product not found" };
        }

        if (product.quantity < quantity) {
            return { success: false, error: "Insufficient stock" };
        }

        // Check if item already in cart
        const existingItem = await prisma.cartItem.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });

        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;
            if (product.quantity < newQuantity) {
                return { success: false, error: "Insufficient stock" };
            }

            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
            });
        } else {
            // Create new cart item
            await prisma.cartItem.create({
                data: {
                    userId,
                    productId,
                    quantity,
                },
            });
        }

        revalidatePath("/cart");
        return { success: true, message: "Added to cart" };
    } catch (error) {
        console.error("Add to cart error:", error);
        return { success: false, error: "Failed to add to cart" };
    }
}

// Update cart item quantity
export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
    try {
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: { product: true },
        });

        if (!cartItem) {
            return { success: false, error: "Cart item not found" };
        }

        if (cartItem.product.quantity < quantity) {
            return { success: false, error: "Insufficient stock" };
        }

        await prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity },
        });

        revalidatePath("/cart");
        return { success: true, message: "Cart updated" };
    } catch (error) {
        console.error("Update cart error:", error);
        return { success: false, error: "Failed to update cart" };
    }
}

// Remove from cart
export async function removeFromCart(cartItemId: string) {
    try {
        await prisma.cartItem.delete({
            where: { id: cartItemId },
        });

        revalidatePath("/cart");
        return { success: true, message: "Removed from cart" };
    } catch (error) {
        console.error("Remove from cart error:", error);
        return { success: false, error: "Failed to remove from cart" };
    }
}

// Apply coupon code
export async function applyCoupon(code: string, subtotal: number) {
    try {
        const result = await validateCoupon(code, subtotal);
        return result;
    } catch (error) {
        console.error("Apply coupon error:", error);
        return { valid: false, discount: 0, message: "Failed to apply coupon" };
    }
}


// Get single order
export async function getOrder(orderId: string, userId: string | undefined) {
    try {
        const order = await prisma.order.findFirst({
            where: {
                orderNumber: orderId,
                userId,
            },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
                billingAddress: true,
                shippingAddress: true,
            },
        });

        if (!order) {
            return { success: false, error: "Order not found" };
        }

        return { success: true, order };
    } catch (error) {
        console.error("Get order error:", error);
        return { success: false, error: "Failed to fetch order" };
    }
}