// Digital Wallet Service for Apple Pay and Google Pay integration with Authorize.net

// Types for digital wallet payments
export type DigitalWalletType = "apple-pay" | "google-pay"

export interface DigitalWalletPaymentData {
  type: DigitalWalletType
  paymentData: any // The payment token/data from Apple Pay or Google Pay
  amount: number
  description: string
  recipientEmail: string
  recipientId: string
}

// Check if Apple Pay is available in the browser
export function isApplePayAvailable(): boolean {
  if (typeof window === "undefined") return false

  // Check if the browser supports Apple Pay
  const hasApplePaySession = !!window.ApplePaySession

  if (!hasApplePaySession) {
    console.log("Apple Pay not available: ApplePaySession not found")
    return false
  }

  try {
    const canMakePayments = window.ApplePaySession.canMakePayments()
    console.log("Apple Pay canMakePayments result:", canMakePayments)
    return canMakePayments
  } catch (err) {
    console.error("Error checking Apple Pay availability:", err)
    return false
  }
}

// Check if Google Pay is available in the browser
export function isGooglePayAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      console.log("Google Pay not available: window is undefined")
      resolve(false)
      return
    }

    // Check if Google Pay API is available
    if (!window.google || !window.google.payments || !window.google.payments.api) {
      console.log("Google Pay not available: API not found in window object")
      resolve(false)
      return
    }

    try {
      console.log("Initializing Google Pay client")
      const client = new window.google.payments.api.PaymentsClient({
        environment: process.env.NODE_ENV === "production" ? "PRODUCTION" : "TEST",
      })

      console.log("Checking if ready to pay with Google Pay")
      client
        .isReadyToPay({
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [
            {
              type: "CARD",
              parameters: {
                allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                allowedCardNetworks: ["AMEX", "DISCOVER", "MASTERCARD", "VISA"],
              },
            },
          ],
        })
        .then((response: any) => {
          console.log("Google Pay isReadyToPay response:", response)
          resolve(response.result)
        })
        .catch((error: any) => {
          console.error("Google Pay isReadyToPay error:", error)
          resolve(false)
        })
    } catch (error) {
      console.error("Error initializing Google Pay client:", error)
      resolve(false)
    }
  })
}

// Process a digital wallet payment through Authorize.net
export async function processDigitalWalletPayment(paymentData: DigitalWalletPaymentData): Promise<any> {
  try {
    const response = await fetch("/api/payments/authorize-net/digital-wallet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Payment processing failed")
    }

    return await response.json()
  } catch (error: any) {
    console.error("Digital wallet payment error:", error)
    throw new Error(error.message || "Payment processing failed")
  }
}
