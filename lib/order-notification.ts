import { sendEmail } from "@/lib/mailer";

const ADMIN_ORDER_NOTIFICATION_RECIPIENTS = [
  "sanaan.arshad@archiwiz.com",
  "Sanankhanktk99@gmail.com",
  "abraiz.khan@archiwiz.com",
];

interface AdminOrderNotificationInput {
  orderNumber: string;
  total: number;
  paymentMethod: string;
  customerEmail?: string | null;
  isLegacyCheckout?: boolean;
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character]!,
  );
}

export async function sendAdminOrderNotification({
  orderNumber,
  total,
  paymentMethod,
  customerEmail,
  isLegacyCheckout = false,
}: AdminOrderNotificationInput): Promise<void> {
  const safeOrderNumber = escapeHtml(orderNumber);
  const safePaymentMethod = escapeHtml(paymentMethod);
  const safeCustomerEmail = escapeHtml(customerEmail || "N/A");
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const adminOrdersUrl = escapeHtml(`${siteUrl}/admin/orders`);

  await sendEmail({
    to: ADMIN_ORDER_NOTIFICATION_RECIPIENTS,
    subject: `New Order Received: ${orderNumber}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #16a34a;">New Order Alert!</h2>
        <p>A new order has been placed${isLegacyCheckout ? " via the legacy checkout" : ""}.</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p><strong>Order Number:</strong> ${safeOrderNumber}</p>
        <p><strong>Total Amount:</strong> PKR ${total.toLocaleString()}</p>
        <p><strong>Payment Method:</strong> ${safePaymentMethod}</p>
        <p><strong>Customer Email:</strong> ${safeCustomerEmail}</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p>Please log in to the admin dashboard to process this order.</p>
        <a href="${adminOrdersUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order</a>
      </div>
    `,
  });
}
