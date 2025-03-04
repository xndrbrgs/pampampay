import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createPayPalTransfer } from "@/lib/paypal"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { amount, recipientId, paymentDescription } = await req.json()
    const { jsonResponse, httpStatusCode } = await createPayPalTransfer(amount, recipientId, userId, paymentDescription)
    return NextResponse.json(jsonResponse, { status: httpStatusCode })
  } catch (error) {
    console.error("Failed to create transfer:", error)
    return NextResponse.json({ error: "Failed to create transfer." }, { status: 500 })
  }
}

