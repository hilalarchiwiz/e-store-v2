import prisma from "@/lib/prisma";
import { describeEmailError, sendEmail } from "@/lib/mailer";
import { parseOrderRecipients } from "@/lib/order-notification-validation";

export const ORDER_RECIPIENTS_KEY = "order_notification_recipients";

export async function getOrderRecipients(): Promise<string[]> {
    const setting = await prisma.setting.findUnique({ where: { key: ORDER_RECIPIENTS_KEY } });
    // Preserve the existing recipient until an administrator saves the list.
    if (!setting) return [
        "sanaan.arshad@archiwiz.com",
        "sanankhanktk99@gmail.com",
        "abraiz.khan@archiwiz.com",
    ];
    const emails: unknown = JSON.parse(setting.value);
    if (!Array.isArray(emails) || !emails.every(email => typeof email === "string")) {
        throw new Error("Invalid order notification recipient settings.");
    }
    return parseOrderRecipients(emails.join("\n"));
}

export async function sendOrderNotification(message: { subject: string; html: string }) {
    const recipients = await getOrderRecipients();
    const results = await Promise.allSettled(recipients.map(to => sendEmail({ ...message, to })));
    const failures = results.filter(result => result.status === "rejected");
    if (failures.length) {
        throw new Error(`${failures.length} of ${recipients.length} order notifications failed. ${describeEmailError(failures[0].reason)}`);
    }
}
