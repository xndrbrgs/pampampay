"use server"

import { z } from "zod"

// Environment variables
const API_LOGIN_ID = process.env.AUTHORIZE_NET_API_LOGIN_ID
const TRANSACTION_KEY = process.env.AUTHORIZE_NET_TRANSACTION_KEY

// Validation schema for payment data
const paymentDataSchema = z.object({
  dataDescriptor: z.string(),
  dataValue: z.string(),
  amount: z.string().transform((val) => Number(val)),
  paymentMethod: z.enum(["credit-card", "google-pay", "apple-pay", "hosted-form", "accept-hosted"]),
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

    // Check if API credentials are available
    if (!API_LOGIN_ID || !TRANSACTION_KEY) {
      logServerPayment(paymentMethod, "Missing API credentials", "ERROR", {
        apiLoginId: API_LOGIN_ID ? "Available" : "Missing",
        transactionKey: TRANSACTION_KEY ? "Available" : "Missing",
      })
      return {
        success: false,
        error: "Payment processor configuration error: Missing API credentials",
      }
    }

    // In a real implementation, you would make an API call to Authorize.net
    // to process the payment using the payment nonce (dataValue)
    logServerPayment(paymentMethod, "Making API call to Authorize.net", "INFO", {
      apiLoginId: "Available",
      paymentMethod,
      amount,
    })

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // For demonstration purposes, we'll simulate a successful transaction
    // In production, you would call Authorize.net's API to process the payment
    const transactionId = `AUTH-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Log transaction details for debugging
    logServerPayment(paymentMethod, "Payment processed successfully", "SUCCESS", {
      transactionId,
      amount,
      recipientId,
      recipientEmail,
      paymentDescription,
    })

    // In a real implementation, you would store the transaction in your database
    // and potentially trigger other actions like sending receipts, updating inventory, etc.

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

// Function to get a token for the hosted payment page
// In a real implementation, this would make an API call to Authorize.net's getHostedPaymentPageRequest
export async function getHostedPaymentPageToken(
  amount: number,
  description: string,
  recipientEmail: string,
): Promise<{ token: string }> {
  try {
    logServerPayment("token", "Generating hosted payment page token", "INFO", {
      amount,
      description,
      recipientEmail,
    })

    // Check if API credentials are available
    if (!API_LOGIN_ID || !TRANSACTION_KEY) {
      logServerPayment("token", "Missing API credentials", "ERROR")
      throw new Error("Payment processor configuration error: Missing API credentials")
    }

    // In a real implementation, you would make an API call to Authorize.net's getHostedPaymentPageRequest
    // Here's what the actual API call would look like:
    /*
    const response = await fetch('https://api.authorize.net/xml/v1/request.api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        getHostedPaymentPageRequest: {
          merchantAuthentication: {
            name: API_LOGIN_ID,
            transactionKey: TRANSACTION_KEY,
          },
          transactionRequest: {
            transactionType: 'authCaptureTransaction',
            amount: amount.toFixed(2),
            order: {
              invoiceNumber: `INV-${Date.now()}`,
              description: description,
            },
            customer: {
              email: recipientEmail,
            },
          },
          hostedPaymentSettings: {
            setting: [
              {
                settingName: 'hostedPaymentReturnOptions',
                settingValue: JSON.stringify({
                  showReceipt: true,
                  url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/complete`,
                  urlText: 'Return to Merchant',
                  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
                  cancelUrlText: 'Cancel Payment',
                }),
              },
              {
                settingName: 'hostedPaymentButtonOptions',
                settingValue: JSON.stringify({
                  text: `Pay $${amount.toFixed(2)}`,
                }),
              },
              {
                settingName: 'hostedPaymentStyleOptions',
                settingValue: JSON.stringify({
                  bgColor: '#ffffff',
                  buttonColor: '#0070f3',
                }),
              },
              {
                settingName: 'hostedPaymentPaymentOptions',
                settingValue: JSON.stringify({
                  showCreditCard: true,
                  showBankAccount: false,
                }),
              },
              {
                settingName: 'hostedPaymentSecurityOptions',
                settingValue: JSON.stringify({
                  captcha: false,
                }),
              },
              {
                settingName: 'hostedPaymentIFrameCommunicatorUrl',
                settingValue: `${process.env.NEXT_PUBLIC_APP_URL}/acceptjs-iframe-communicator.html`,
              },
            ],
          },
        },
      }),
    });

    const data = await response.json();
    
    if (data.messages.resultCode !== 'Ok') {
      throw new Error(data.messages.message[0].text);
    }

    return { token: data.token };
    */

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // For demo purposes, we'll simulate a successful token generation
    const token = `token-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    logServerPayment("token", "Hosted payment page token generated successfully", "SUCCESS", { token })

    return { token }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    logServerPayment("token", "Error generating hosted payment page token", "ERROR", { error: errorMessage })
    throw error
  }
}

// Function to handle the response from Authorize.net's hosted payment page
export async function handleHostedPaymentResponse(formData: FormData): Promise<PaymentResponse> {
  try {
    // Extract data from the response
    const responseText = formData.get("response") as string

    if (!responseText) {
      return {
        success: false,
        error: "No response received from payment processor",
      }
    }

    let response
    try {
      response = JSON.parse(responseText)
    } catch (e) {
      return {
        success: false,
        error: "Invalid response format from payment processor",
      }
    }

    logServerPayment("hosted", "Received hosted payment response", "INFO", response)

    // Check if the transaction was successful
    if (response.responseCode === "1") {
      // Transaction approved
      return {
        success: true,
        transactionId: response.transId,
      }
    } else {
      // Transaction declined or error
      return {
        success: false,
        error: response.responseText || "Payment was declined or an error occurred",
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    logServerPayment("hosted", "Error processing hosted payment response", "ERROR", { error: errorMessage })

    return {
      success: false,
      error: errorMessage,
    }
  }
}
