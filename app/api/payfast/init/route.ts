import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
    const { amount, order_id } = await req.json();

    const merchantId = process.env.PAYFAST_MERCHANT_ID;
    const securedKey = process.env.PAYFAST_SECURED_KEY;

    const payload = {
        merchant_id: merchantId,
        amount: amount,
        order_id: order_id,
        currency: "PKR",
        bill_desc: `Order #${order_id}`,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
        notify_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payfast/ipn`
    };

    const sorted = Object.keys(payload)
        .sort()
        .map(k => `${k}=${payload[k]}`)
        .join("&");

    const signature = crypto
        .createHash("md5")
        .update(sorted + securedKey)
        .digest("hex");

    return NextResponse.json({
        ...payload,
        signature,
        payment_url: "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/PostTransaction"
    });
}
