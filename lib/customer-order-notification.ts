import type { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { sendEmail } from "./mailer";

const statusMessages: Record<OrderStatus, { label: string; message: string }> = {
  PENDING: { label: "pending", message: "Your order is awaiting confirmation." },
  PROCESSING: { label: "processing", message: "We are preparing your order." },
  CONFIRMED: { label: "confirmed", message: "Your order has been confirmed." },
  SHIPPED: { label: "shipped", message: "Your order has been shipped and is on its way." },
  DELIVERED: { label: "delivered", message: "Your order has been marked as delivered. Thank you for shopping with us!" },
  CANCELLED: { label: "cancelled", message: "Your order has been cancelled. Please contact us if you have any questions." },
  RETURNED: { label: "returned", message: "Your order has been marked as returned. Please contact us if you need assistance." },
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

export interface CustomerOrderUpdate {
  orderNumber: string;
  status: OrderStatus;
  billingAddress: { email: string; firstName: string };
  user: { email: string; name: string };
}

// Return a warning separately: a mail failure must never undo a committed order update.
export async function notifyCustomerOrderStatus(
  previousStatus: OrderStatus,
  order: CustomerOrderUpdate,
  send: typeof sendEmail = sendEmail,
): Promise<string | undefined> {
  if (previousStatus === order.status) return;
  const to = [order.billingAddress.email, order.user.email]
    .map(email => email.trim())
    .find(email => z.email().safeParse(email).success);
  if (!to) return "The order was saved, but the customer email was not sent because no valid customer email address is available.";
  const { label, message } = statusMessages[order.status];
  const name = order.billingAddress.firstName || order.user.name || "Customer";
  try {
    await send({
      to,
      subject: `Order ${order.orderNumber.replace(/[\r\n]/g, "")} ${label}`,
      html: `<div style="font-family: sans-serif; padding: 24px; color: #1f2937;">
        <h2>Order ${label}</h2>
        <p>Hello ${escapeHtml(name)},</p>
        <p>${message}</p>
        <p><strong>Order number:</strong> ${escapeHtml(order.orderNumber)}</p>
        <p><strong>Status:</strong> ${label}</p>
        <p>You can view your order details in your account.</p>
      </div>`,
    });
  } catch {
    return "The order was saved, but the customer status email could not be sent. Check the email configuration before contacting the customer.";
  }
}
