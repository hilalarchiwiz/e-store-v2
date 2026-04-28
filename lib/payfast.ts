import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

export function createPayFastPayload(amount: number, orderId: string) {
    const merchantId = process.env.PAYFAST_MERCHANT_ID;
    const securedKey = process.env.PAYFAST_SECURED_KEY;

    const payload: any = {
        merchant_id: merchantId,
        amount,
        order_id: orderId,
        currency: "PKR",
        bill_desc: `Order #${orderId}`,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
        notify_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payfast/ipn`,
    };

    const sorted = Object.keys(payload)
        .sort()
        .map((k) => `${k}=${payload[k]}`)
        .join("&");

    payload.signature = crypto
        .createHash("md5")
        .update(sorted + securedKey)
        .digest("hex");

    payload.payment_url = "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/PostTransaction";

    return payload;
}
