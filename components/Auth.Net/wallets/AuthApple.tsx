"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { isApplePayAvailable, processDigitalWalletPayment } from "@/services/authdigitalwallets"

type ApplePayButtonProps = {
  amount: number
  recipientId: string
  paymentDescription: string
  recipientEmail: string
  onSuccess: () => void
  onError: (message: string) => void
}

export function ApplePayButton({
  amount,
  recipientId,
  paymentDescription,
  recipientEmail,
  onSuccess,
  onError,
}: ApplePayButtonProps) {
  const [isAvailable, setIsAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if Apple Pay is available
  useEffect(() => {
    setIsAvailable(isApplePayAvailable())
  }, [])

  const handleApplePayment = async () => {
    if (!isAvailable) {
      onError("Apple Pay is not available on this device or browser.")
      return
    }

    setIsLoading(true)

    try {
      // Create an Apple Pay session
      const merchantIdentifier = process.env.NEXT_PUBLIC_APPLE_PAY_MERCHANT_ID || "merchant.com.yourcompany.app"
      const session = new window.ApplePaySession(6, {
        countryCode: "US",
        currencyCode: "USD",
        supportedNetworks: ["visa", "masterCard", "amex", "discover"],
        merchantCapabilities: ["supports3DS"],
        total: {
          label: "Your Company Name",
          amount: amount.toFixed(2),
          type: "final",
        },
        requiredBillingContactFields: ["postalAddress", "name", "email"],
      })

      // Handle validation of merchant
      session.onvalidatemerchant = async (event) => {
        try {
          // In a real implementation, you would call your server to validate the merchant
          // For testing, we'll simulate a successful validation
          const merchantSession = await validateMerchant(event.validationURL)
          session.completeMerchantValidation(merchantSession)
        } catch (error) {
          console.error("Merchant validation failed:", error)
          session.abort()
          setIsLoading(false)
          onError("Apple Pay merchant validation failed.")
        }
      }

      // Handle payment authorization
      session.onpaymentauthorized = async (event) => {
        try {
          // Process the payment with Authorize.net
          const result = await processDigitalWalletPayment({
            type: "apple-pay",
            paymentData: event.payment,
            amount,
            description: paymentDescription,
            recipientEmail,
            recipientId,
          })

          if (result.success) {
            session.completePayment(window.ApplePaySession.STATUS_SUCCESS)
            setIsLoading(false)
            onSuccess()
          } else {
            session.completePayment(window.ApplePaySession.STATUS_FAILURE)
            setIsLoading(false)
            onError(result.message || "Payment failed")
          }
        } catch (error: any) {
          console.error("Payment processing error:", error)
          session.completePayment(window.ApplePaySession.STATUS_FAILURE)
          setIsLoading(false)
          onError(error.message || "Payment processing failed")
        }
      }

      // Handle cancellation
      session.oncancel = () => {
        setIsLoading(false)
      }

      // Begin the Apple Pay session
      session.begin()
    } catch (error: any) {
      console.error("Apple Pay error:", error)
      setIsLoading(false)
      onError(error.message || "Apple Pay initialization failed")
    }
  }

  // This would be a server call to validate the merchant
  const validateMerchant = async (validationURL: string) => {
    // In a real implementation, you would call your server to validate with Apple
    // For testing, we'll simulate a successful validation
    return {
      merchantSessionIdentifier: "mock-session-identifier",
      displayName: "Your Company Name",
      initiative: "web",
      initiativeContext: window.location.hostname,
    }
  }

  if (!isAvailable) {
    return null // Don't render the button if Apple Pay is not available
  }

  return (
    <Button
      onClick={handleApplePayment}
      disabled={isLoading}
      className="w-full bg-black text-white hover:bg-gray-800 flex items-center justify-center"
    >
      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.6 7.8c-.8.9-2.1 1.6-3.3 1.5-.2-1.5.5-3 1.4-3.9.8-.9 2.2-1.6 3.2-1.6.1 1.5-.4 3-1.3 4zM16.3 9.5c-1.8-.1-3.3 1-4.2 1-.9 0-2.2-1-3.6-1-1.9 0-3.6 1.1-4.5 2.7-1.9 3.3-.5 8.3 1.4 11 .9 1.3 2 2.8 3.4 2.8 1.4-.1 1.9-.9 3.5-.9 1.6 0 2.1.9 3.5.9 1.4 0 2.4-1.3 3.3-2.6.7-1 1.2-2 1.5-3.1-3.8-1.4-3.5-6.8.3-8.8-.8-1.2-2.1-1.9-3.6-2z" />
      </svg>
      Pay with Apple Pay
    </Button>
  )
}
