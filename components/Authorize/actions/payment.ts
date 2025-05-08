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
  // Validate environment variables
  if (!API_LOGIN_ID || !TRANSACTION_KEY) {
    console.error("Missing Authorize.net credentials")
    throw new Error("Payment gateway configuration error")
  }

  // API endpoint based on environment
  const apiEndpoint =
    ENVIRONMENT === "PRODUCTION"
      ? "https://api.authorize.net/xml/v1/request.api"
      : "https://apitest.authorize.net/xml/v1/request.api"

  // Current domain for the communicator URL
  const domain = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  // Validate amount format (must be a valid number with up to 2 decimal places)
  const amountRegex = /^\d+(\.\d{1,2})?$/
  if (!amountRegex.test(data.amount)) {
    console.error("Invalid amount format:", data.amount)
    throw new Error("Invalid payment amount format")
  }

  // Create a simplified payload without customer ID to avoid potential issues
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
        // Omitting customer ID to simplify the request
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
    console.log("Sending request to Authorize.net:", JSON.stringify(payload, null, 2))

    // Make the API request to Authorize.net
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    // Log response status
    console.log("Authorize.net response status:", response.status)

    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text()
      console.error("API request failed:", response.status, errorText)
      throw new Error(`API request failed with status ${response.status}`)
    }

    // Parse the response
    const result = await response.json()
    console.log("Authorize.net response:", JSON.stringify(result, null, 2))

    // Check if the request was successful
    if (result.messages?.resultCode !== "Ok") {
      const errorMessage = result.messages?.message?.[0]?.text || "Failed to get payment token"
      console.error("Authorize.net error:", errorMessage, result)
      throw new Error(errorMessage)
    }

    // Validate that we received a token
    if (!result.token) {
      console.error("No token received from Authorize.net:", result)
      throw new Error("No payment token received from the payment gateway")
    }

    // Return the token
    return result.token
  } catch (error) {
    console.error("Error getting form token:", error)

    // Provide more specific error messages based on the error
    if (error instanceof Error) {
      if (error.message.includes("CORS")) {
        throw new Error("Cross-origin request blocked. Please check your domain settings.")
      }
      if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
        throw new Error("Network error. Please check your internet connection.")
      }
      if (error.message.includes("timeout")) {
        throw new Error("Request timed out. Please try again.")
      }
      // Rethrow the original error with its message
      throw new Error(`Payment gateway error: ${error.message}`)
    }

    // Generic fallback error
    throw new Error("Failed to initialize payment form")
  }
}

/**
 * Server action to process the payment response from Authorize.net
 */
export async function processPaymentResponse(response: any) {
  try {
    // Log the full response for debugging
    console.log("Processing payment response:", JSON.stringify(response, null, 2))

    // Validate the response
    if (!response || !response.transId) {
      console.error("Invalid payment response:", response)
      return { success: false, message: "Invalid payment response" }
    }

    // Here you would typically store the transaction in your database
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
