import { processPaymentResponse } from "@/components/Authorize/actions/payment"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        // Process the payment response
        const result = await processPaymentResponse(data)

        // Redirect based on payment result
        const redirectUrl = result.success
            ? "/payment/success?transactionId=" + result.transactionId
            : "/payment/failed?message=" + encodeURIComponent(result.message || "Payment failed")

        return NextResponse.json({
            success: result.success,
            redirectUrl,
        })
    } catch (error) {
        console.error("Error in payment callback:", error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}
