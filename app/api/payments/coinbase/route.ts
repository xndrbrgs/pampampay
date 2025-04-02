import { NextResponse } from "next/server"
import { createCharge } from "@/lib/coinbase"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/db"

export async function POST(req: Request) {
    try {
        // Get the authenticated user
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const { amount, paymentDescription, recipientEmail, recipientId } = await req.json()

        console.log("Received payment request:", { amount, paymentDescription, recipientEmail, recipientId })

        // Validate input
        if (!amount || !paymentDescription || !recipientEmail || !recipientId) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
        }

        // Get the sender from the database
        const sender = await prisma.user.findFirst({
            where: { clerkUserId: userId },
        })

        if (!sender) {
            return NextResponse.json({ success: false, message: "Sender not found" }, { status: 404 })
        }

        // Create a charge with Coinbase Commerce
        try {
            const charge = await createCharge({
                name: paymentDescription,
                description: `Payment for ${paymentDescription}`,
                local_price: {
                    amount: amount.toString(),
                    currency: "USD",
                },
                pricing_type: "fixed_price",
                metadata: {
                    customer_email: recipientEmail,
                    recipient_id: recipientId,
                    sender_id: userId,
                },
                redirect_url: `${process.env.NEXT_PUBLIC_APP_URL!}/dashboard/payment/coinbase/success`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL!}/dashboard/payment/coinbase/cancel`,
            })

            console.log("Charge created successfully:", charge.id)

            // Create a transaction record in the database
            const transaction = await prisma.coinbaseTransfer.create({
                data: {
                    amount: Number.parseFloat(amount),
                    currency: "USD",
                    status: "PENDING",
                    description: paymentDescription,
                    coinbaseChargeId: charge.id,
                    coinbaseCode: charge.code,
                    senderId: sender.id,
                    receiverId: recipientId,
                },
            })

            console.log("Transaction record created:", transaction.id)

            // Return the charge data
            return NextResponse.json({
                success: true,
                data: {
                    id: charge.id,
                    code: charge.code,
                    hosted_url: charge.hosted_url,
                    created_at: charge.created_at,
                    expires_at: charge.expires_at,
                    transactionId: transaction.id,
                },
            })
        } catch (chargeError: any) {
            console.error("Failed to create charge:", chargeError.message)
            return NextResponse.json(
                { success: false, message: `Failed to create Coinbase charge: ${chargeError.message}` },
                { status: 500 },
            )
        }
    } catch (error: any) {
        console.error("Error in Coinbase payment API:", error)
        return NextResponse.json(
            { success: false, message: `Failed to process payment: ${error.message}` },
            { status: 500 },
        )
    }
}

