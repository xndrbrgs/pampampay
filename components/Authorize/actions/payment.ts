"use server"

// Environment variables for Authorize.net
const API_LOGIN_ID = process.env.AUTHORIZE_NET_API_LOGIN_ID!
const TRANSACTION_KEY = process.env.AUTHORIZE_NET_TRANSACTION_KEY!
const ENVIRONMENT = process.env.NODE_ENV === "production" ? "PRODUCTION" : "SANDBOX"

/**
 * Server action to get a form token from Authorize.net
 */
export async function getFormToken(data: {
  amount: string
  description?: string
  customerId?: string
  invoiceNumber?: string
}) {
  // API endpoint based on environment
  const apiEndpoint =
    ENVIRONMENT === "PRODUCTION"
      ? "https://api.authorize.net/xml/v1/request.api"
      : "https://apitest.authorize.net/xml/v1/request.api"

  // Current domain for the communicator URL
  const domain = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  // Create the request payload for Authorize.net
  const payload = {
    getHostedPaymentPageRequest: {
      merchantAuthentication: {
        name: API_LOGIN_ID,
        transactionKey: TRANSACTION_KEY,
      },
      transactionRequest: {
        transactionType: "authCaptureTransaction",
        amount: data.amount,
        order: {
          invoiceNumber: data.invoiceNumber || `INV-${Date.now()}`,
          description: data.description || "Payment",
        },
        customer: data.customerId
          ? {
              id: data.customerId,
            }
          : undefined,
      },
      hostedPaymentSettings: {
        setting: [
          {
            settingName: "hostedPaymentReturnOptions",
            settingValue: `{"showReceipt": false, "url": "${domain}/payment", "cancelUrl": "${domain}/payment", "cancelUrlText": "Cancel Payment"}`,
          },
          {
            settingName: "hostedPaymentButtonOptions",
            settingValue: `{"text": "Pay Now"}`,
          },
          {
            settingName: "hostedPaymentStyleOptions",
            settingValue: `{"bgColor": "#ffffff"}`,
          },
          {
            settingName: "hostedPaymentIFrameCommunicatorUrl",
            settingValue: `${domain}/authorize-communicator.html`,
          },
        ],
      },
    },
  }

  try {
    // Make the API request to Authorize.net
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const result = await response.json()

    // Check if the request was successful
    if (result.messages?.resultCode !== "Ok") {
      const errorMessage = result.messages?.message?.[0]?.text || "Failed to get payment token"
      throw new Error(errorMessage)
    }

    // Return the token
    return result.token
  } catch (error) {
    console.error("Error getting form token:", error)
    throw new Error("Failed to initialize payment form")
  }
}

/**
 * Server action to process the payment response from Authorize.net
 */
export async function processPaymentResponse(response: any) {
  try {
    // Validate the response
    if (!response || !response.transId) {
      return { success: false, message: "Invalid payment response" }
    }

    // Here you would typically store the transaction in your database
    // For now, we'll just log it
    console.log("Transaction processed:", {
      transactionId: response.transId,
      amount: response.amount || "0.00",
      status: response.responseCode === "1" ? "approved" : "declined",
      responseCode: response.responseCode,
      responseText: response.responseText || "",
      recipientId: response.recipientId,
      recipientEmail: response.recipientEmail,
      paymentDescription: response.paymentDescription,
    })

    // In a real implementation, you would:
    // 1. Store the transaction in your database
    // 2. Update user balances or subscription status
    // 3. Send confirmation emails
    // 4. Handle any other business logic

    return {
      success: response.responseCode === "1",
      transactionId: response.transId,
      message: response.responseText || (response.responseCode === "1" ? "Payment successful" : "Payment failed"),
    }
  } catch (error) {
    console.error("Error processing payment response:", error)
    return { success: false, message: "Error processing payment" }
  }
}
