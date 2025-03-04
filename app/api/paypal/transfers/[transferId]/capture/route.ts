import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { capturePayPalOrder } from "@/lib/paypal"
import { json } from "stream/consumers"
import prisma from "@/lib/db"

export async function POST(req: Request, { params }: { params: { transferId: string } }) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { transferId } = await params
        const { jsonResponse, httpStatusCode } = await capturePayPalOrder(transferId)

        if (jsonResponse.status === "COMPLETED") {
            // Update the transfer status in the database
            await prisma.paypalTransfer.update({
                where: { id: transferId },
                data: { status: "COMPLETED" },
            })
        }
        // Check if the response contains an error
        if (jsonResponse.error) {
            return NextResponse.json({ error: jsonResponse.error }, { status: httpStatusCode })
        }
        return NextResponse.json(jsonResponse, { status: httpStatusCode })
    } catch (error) {
        console.error("Failed to capture transfer:", error)
        return NextResponse.json({ error: "Failed to capture transfer." }, { status: 500 })
    }
}

