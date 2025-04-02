import { NextResponse } from "next/server"
import { headers } from "next/headers"
import crypto from "crypto"
import prisma from "@/lib/db"

export async function POST(req: Request) {
  try {
    // Get the request body as text for signature verification
    const rawBody = await req.text()
    const body = JSON.parse(rawBody)

    // Get the Coinbase signature from headers
    const headersList = await headers()
    const signature = headersList.get("x-cc-webhook-signature")

    if (!signature) {
      console.error("Missing Coinbase webhook signature")
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    // Verify the webhook signature
    const isValid = verifyWebhookSignature(signature, process.env.COINBASE_WEBHOOK_SECRET!, rawBody)

    if (!isValid) {
      console.error("Invalid Coinbase webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    console.log("Received valid Coinbase webhook:", body.event.type)

    // Handle different event types
    switch (body.event.type) {
      case "charge:confirmed":
        await handleChargeConfirmed(body.event.data)
        break
      case "charge:failed":
        await handleChargeFailed(body.event.data)
        break
      case "charge:delayed":
        await handleChargeDelayed(body.event.data)
        break
      case "charge:pending":
        await handleChargePending(body.event.data)
        break
      case "charge:resolved":
        await handleChargeResolved(body.event.data)
        break
      default:
        console.log(`Unhandled event type: ${body.event.type}`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error processing Coinbase webhook:", error)
    return NextResponse.json({ error: `Webhook processing failed: ${error.message}` }, { status: 500 })
  }
}

// Verify the webhook signature
function verifyWebhookSignature(signature: string, secret: string, payload: string): boolean {
  try {
    const hmac = crypto.createHmac("sha256", secret)
    const computedSignature = hmac.update(payload).digest("hex")
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature))
  } catch (error) {
    console.error("Error verifying webhook signature:", error)
    return false
  }
}

// Handle charge:confirmed event
async function handleChargeConfirmed(data: any) {
  try {
    const chargeId = data.id
    console.log(`Processing confirmed charge: ${chargeId}`)

    // Update transaction status in database
    const transaction = await prisma.coinbaseTransfer.update({
      where: { coinbaseChargeId: chargeId },
      data: {
        status: "COMPLETED",
        updatedAt: new Date(),
      },
    })

    console.log(`Updated transaction ${transaction.id} status to COMPLETED`)

    // Process any business logic for completed payments
    // For example, credit the recipient's account, send notifications, etc.
    // await processCompletedPayment(transaction)

    return transaction
  } catch (error) {
    console.error("Error handling charge confirmed event:", error)
    throw error
  }
}

// Handle charge:failed event
async function handleChargeFailed(data: any) {
  try {
    const chargeId = data.id
    console.log(`Processing failed charge: ${chargeId}`)

    // Update transaction status in database
    const transaction = await prisma.coinbaseTransfer.update({
      where: { coinbaseChargeId: chargeId },
      data: {
        status: "FAILED",
        updatedAt: new Date(),
      },
    })

    console.log(`Updated transaction ${transaction.id} status to FAILED`)

    return transaction
  } catch (error) {
    console.error("Error handling charge failed event:", error)
    throw error
  }
}

// Handle charge:delayed event
async function handleChargeDelayed(data: any) {
  try {
    const chargeId = data.id
    console.log(`Processing delayed charge: ${chargeId}`)

    // Update transaction status in database
    const transaction = await prisma.coinbaseTransfer.update({
      where: { coinbaseChargeId: chargeId },
      data: {
        status: "DELAYED",
        updatedAt: new Date(),
      },
    })

    console.log(`Updated transaction ${transaction.id} status to DELAYED`)

    return transaction
  } catch (error) {
    console.error("Error handling charge delayed event:", error)
    throw error
  }
}

// Handle charge:pending event
async function handleChargePending(data: any) {
  try {
    const chargeId = data.id
    console.log(`Processing pending charge: ${chargeId}`)

    // Update transaction status in database
    const transaction = await prisma.coinbaseTransfer.update({
      where: { coinbaseChargeId: chargeId },
      data: {
        status: "PENDING",
        updatedAt: new Date(),
      },
    })

    console.log(`Updated transaction ${transaction.id} status to PENDING`)

    return transaction
  } catch (error) {
    console.error("Error handling charge pending event:", error)
    throw error
  }
}

// Handle charge:resolved event
async function handleChargeResolved(data: any) {
  try {
    const chargeId = data.id
    console.log(`Processing resolved charge: ${chargeId}`)

    // Update transaction status in database
    const transaction = await prisma.coinbaseTransfer.update({
      where: { coinbaseChargeId: chargeId },
      data: {
        status: "RESOLVED",
        updatedAt: new Date(),
      },
    })

    console.log(`Updated transaction ${transaction.id} status to RESOLVED`)

    return transaction
  } catch (error) {
    console.error("Error handling charge resolved event:", error)
    throw error
  }
}

// Process a completed payment
async function processCompletedPayment(transaction: any) {
  // Implement your business logic for completed payments
  // For example:
  // 1. Credit the recipient's account
  // 2. Send email notifications
  // 3. Update any related records

  try {
    // Example: Update recipient's balance
    if (transaction.recipientId) {
      await prisma.coinbaseTransfer.update({
        where: { id: transaction.recipientId },
        data: {
          balance: {
            increment: transaction.amount,
          },
        },
      })

      console.log(`Credited ${transaction.amount} to recipient ${transaction.recipientId}`)

      // You could also send notifications here
      // await sendPaymentNotification(transaction);
    }
  } catch (error) {
    console.error("Error processing completed payment:", error)
    throw error
  }
}

