import { z } from "zod";

export function parseOrderRecipients(input: string): string[] {
    const emails = [...new Set(input.split(/[,;\n]+/).map(email => email.trim().toLowerCase()).filter(Boolean))];
    if (emails.length > 50) throw new Error("Enter no more than 50 email addresses.");
    for (const email of emails) {
        if (!z.email().safeParse(email).success) throw new Error(`Invalid email address: ${email}`);
    }
    return emails;
}
