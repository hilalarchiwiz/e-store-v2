import { createPayFastPayload } from "../payfast";

export async function initiateAPS(order: {
    orderNumber: string;
    total: number;
}) {
    const payload = createPayFastPayload(order.total, order.orderNumber);

    // Convert to x-www-form-urlencoded
    const form = new URLSearchParams();
    for (const key in payload) {
        if (key !== "payment_url") {
            form.append(key, payload[key]);
        }
    }

    const res = await fetch(payload.payment_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
    });

    const responseText = await res.text();

    return {
        raw: responseText,
        redirectHTML: responseText,
    };
}
