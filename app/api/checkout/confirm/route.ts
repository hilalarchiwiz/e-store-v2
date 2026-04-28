import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const order_id = url.searchParams.get("order_id");
        const tracker = url.searchParams.get("tracker");
        const reference = url.searchParams.get("reference");
        const sig = url.searchParams.get("sig");

        console.log("Safepay redirect:", { order_id, tracker, reference, sig });

        if (!order_id || !tracker || !reference || !sig) {
            console.error("Missing Safepay params");
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/checkout/failed`);
        }

        // verify signature
        const secret = process.env.SAFEPAY_SECRET_KEY!;
        const expectedSig = crypto
            .createHmac("sha256", secret)
            .update(tracker)
            .digest("hex");

        if (expectedSig !== sig) {
            console.error("Signature mismatch");

            await prisma.order.update({
                where: { orderNumber: order_id },
                data: { paymentStatus: "FAILED", notes: "Signature mismatch" }
            });

            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/checkout/failed`);
        }

        // Mark order paid (but don't block redirect)
        prisma.order.update({
            where: { orderNumber: order_id },
            data: {
                paymentStatus: "PAID",
                safepayReference: reference,
                safepayTracker: tracker
            }
        }).catch(console.error);

        // Respond IMMEDIATELY
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_SITE_URL}/order-confirmation/${order_id}`
        );

    } catch (err) {
        console.error("Confirm route crashed:", err);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/checkout/failed`);
    }
}
