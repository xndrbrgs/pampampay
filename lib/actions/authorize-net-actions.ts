"use server"

import { z } from "zod"

// Environment variables
const API_LOGIN_ID = process.env.AUTHORIZE_NET_API_LOGIN_ID!

// Validation schema for payment data
const paymentDataSchema = z.object({
  dataDescriptor: z.string(),
  dataValue: z.string(),
  amount: z.string().transform((val) => Number(val)),
  paymentMethod: z.enum(["credit-card", "google-pay", "apple-pay"]),
  recipientId: z.string(),
  recipientEmail: z.string().email(),
  paymentDescription: z.string(),
})

type PaymentResponse = {
  success: boolean
  transactionId?: string
  error?: string
}

// Server-side logging function
function logServerPayment(method: string, message: string, level = "INFO", data?: any) {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [SERVER:PAYMENT:${method.toUpperCase()}] [${level}]`

  console.log(`${prefix} ${message}`)

  if (data) {
    console.log(`${prefix} Additional data:`, data)
  }
}

export async function processAuthorizeNetPayment(formData: FormData): Promise<PaymentResponse> {
  try {
    // Extract data from form
    const dataDescriptor = formData.get("dataDescriptor") as string
    const dataValue = formData.get("dataValue") as string
    const amount = formData.get("amount") as string
    const paymentMethod = formData.get("paymentMethod") as string
    const recipientId = formData.get("recipientId") as string
    const recipientEmail = formData.get("recipientEmail") as string
    const paymentDescription = formData.get("paymentDescription") as string

    logServerPayment(paymentMethod, "Payment processing started", "INFO", {
      dataDescriptor,
      amount,
      recipientId,
      paymentDescription,
    })

    // Validate the data
    try {
      const validatedData = paymentDataSchema.parse({
        dataDescriptor,
        dataValue,
        amount,
        paymentMethod,
        recipientId,
        recipientEmail,
        paymentDescription,
      })

      logServerPayment(paymentMethod, "Payment data validated successfully", "INFO", {
        amount: validatedData.amount,
        paymentMethod: validatedData.paymentMethod,
      })
    } catch (validationError) {
      logServerPayment(paymentMethod, "Payment data validation failed", "ERROR", validationError)
      return {
        success: false,
        error:
          "Invalid payment data: " +
          (validationError instanceof Error ? validationError.message : String(validationError)),
      }
    }

    // Check if API_LOGIN_ID is available
    if (!API_LOGIN_ID) {
      logServerPayment(paymentMethod, "Missing API_LOGIN_ID environment variable", "ERROR")
      return {
        success: false,
        error: "Payment processor configuration error",
      }
    }

    // In a real implementation, you would make an API call to Authorize.net
    // to process the payment using the payment nonce (dataValue)
    logServerPayment(paymentMethod, "Making API call to Authorize.net", "INFO", {
      apiLoginId: API_LOGIN_ID ? "Available" : "Missing",
      paymentMethod,
      amount,
    })

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // For demonstration purposes, we'll simulate a successful transaction
    // In production, you would call Authorize.net's API to process the payment
    const transactionId = `AUTH-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    logServerPayment(paymentMethod, "Payment processed successfully", "SUCCESS", {
      transactionId,
      amount,
      recipientId,
    })

    return {
      success: true,
      transactionId,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    logServerPayment("unknown", "Payment processing error", "ERROR", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    })

    return {
      success: false,
      error: errorMessage,
    }
  }
}
