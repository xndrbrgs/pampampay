// app/api/btcpay/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";
import { saveBTCPayment } from "@/lib/actions/btc-actions";

const BTCPAY_WEBHOOK = process.env.BTCPAY_WEBHOOK!;

export async function POST(req: NextRequest) {
    const signature = req.headers.get("BTCPay-Sig");

    const rawBody = await req.text();
    const calculatedSig = `sha256=${crypto
        .createHmac("sha256", BTCPAY_WEBHOOK)
        .update(rawBody)
        .digest("hex")}`;

    if (signature !== calculatedSig) {
        return new NextResponse("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // Optionally log or handle specific event types
    if (event.type === "InvoiceCreated") {
        console.log("BTCPay invoice created data:", event);

        return NextResponse.json({ received: true });
    }
    // Optionally log or handle specific event types
    if (event.type === "InvoiceSettled") {
        const invoiceId = event.invoiceId;
        const status = event?.status;

        // Check if we already have the invoice stored
        const existingPayment = await prisma.bTCTransfer.findUnique({
            where: { id: invoiceId },
        });

        if (existingPayment) {
            await prisma.bTCTransfer.update({
                where: { id: invoiceId },
                data: { status },
            });
        } else {
            return NextResponse.json({ received: true });
        }
    }

    return NextResponse.json({ received: true });
}
