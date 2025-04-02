import { NextResponse } from "next/server"
import { z } from "zod"
import { createCharge } from "@/lib/coinbase"

// Validation schema for the request body
const paymentSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    amount: z.number().positive(),
    currency: z.string().min(1),
    paymentMethod: z.enum(["crypto", "card", "bank"]),
    description: z.string().optional(),
})

export async function POST(req: Request) {
    try {
        // Parse and validate the request body
        const body = await req.json()
        const validatedData = paymentSchema.parse(body)

        // Determine which payment methods to enable based on the selected method
        const paymentMethods = []

        if (validatedData.paymentMethod === "crypto") {
            paymentMethods.push("bitcoin", "ethereum", "usdc")
        } else if (validatedData.paymentMethod === "card") {
            paymentMethods.push("card")
        } else if (validatedData.paymentMethod === "bank") {
            paymentMethods.push("bank_transfer")
        }

        // Create a charge with Coinbase Commerce
        const charge = await createCharge(
            {
                name: "Payment",
                description: validatedData.description || `Payment from ${validatedData.name}`,
                local_price: {
                    amount: validatedData.amount.toString(),
                    currency: validatedData.currency,
                },
                pricing_type: "fixed_price",
                metadata: {
                    customer_name: validatedData.name,
                    customer_email: validatedData.email,
                },
                redirect_url: `${process.env.NEXT_PUBLIC_APP_URL!}/dashboard/payment/coinbase/success`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL!}/dashboard/payment/coinbase/cancel`,
                requested_info: ["name", "email"],
            },
            paymentMethods,
        )

        // Return the charge data
        return NextResponse.json({
            success: true,
            data: {
                id: charge.id,
                code: charge.code,
                hosted_url: charge.hosted_url,
                created_at: charge.created_at,
                expires_at: charge.expires_at,
            },
        })
    } catch (error) {
        console.error("Error creating payment:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Invalid payment data", errors: error.errors },
                { status: 400 },
            )
        }

        return NextResponse.json({ success: false, message: "Failed to create payment" }, { status: 500 })
    }
}
