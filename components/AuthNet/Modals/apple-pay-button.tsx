"use client"

import { useEffect, useState } from "react"
import { processAuthorizeNetPayment } from "@/lib/actions/authorize-net-actions"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
// Add import for the logger
import { logInfo, logWarning, logError, logSuccess, logDebug } from "@/utils/payment-logger"

declare global {
  interface Window {
    Accept: any
    ApplePaySession: any
  }
}

interface ApplePayButtonProps {
  amount: number
  recipientId: string
  recipientEmail: string
  paymentDescription: string
  onPaymentStatusChange: (status: "idle" | "processing" | "success" | "error") => void
  onError: (message: string | null) => void
}

export default function ApplePayButton({
  amount,
  recipientId,
  recipientEmail,
  paymentDescription,
  onPaymentStatusChange,
  onError,
}: ApplePayButtonProps) {
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Update the useEffect hook for script loading
  useEffect(() => {
    logInfo("apple-pay", "Initializing Apple Pay")
    // Load Authorize.net Accept.js script
    const script = document.createElement("script")
    script.src = "https://js.authorize.net/v1/Accept.js"
    script.async = true
    script.onload = () => {
      logSuccess("apple-pay", "Authorize.net Accept.js loaded successfully")
      checkApplePayAvailability()
    }
    script.onerror = (error) => {
      logError("apple-pay", "Failed to load Authorize.net Accept.js", error)
      setIsLoading(false)
    }
    document.body.appendChild(script)

    return () => {
      logInfo("apple-pay", "Cleaning up Apple Pay resources")
      document.body.removeChild(script)
    }
  }, [])

  // Update the checkApplePayAvailability function
  const checkApplePayAvailability = () => {
    logInfo("apple-pay", "Checking Apple Pay availability")

    // Check if Apple Pay is available
    const isApplePayAvailable = window.ApplePaySession && window.ApplePaySession.canMakePayments()

    if (isApplePayAvailable) {
      logSuccess("apple-pay", "Apple Pay is available on this device/browser")
    } else {
      logWarning("apple-pay", "Apple Pay is not available on this device/browser", {
        ApplePaySession: !!window.ApplePaySession,
        canMakePayments: window.ApplePaySession ? !!window.ApplePaySession.canMakePayments : false,
      })
    }

    setIsApplePayAvailable(isApplePayAvailable)
    setIsLoading(false)
  }

  // Update the handleApplePayClick function
  const handleApplePayClick = async () => {
    try {
      logInfo("apple-pay", "Apple Pay payment initiated", { amount })
      onPaymentStatusChange("processing")

      // Configure Apple Pay session
      const paymentRequest = {
        countryCode: "US",
        currencyCode: "USD",
        supportedNetworks: ["visa", "masterCard", "amex", "discover"],
        merchantCapabilities: ["supports3DS"],
        total: {
          label: "Your Store Name",
          amount: amount.toFixed(2),
        },
      }

      logDebug("apple-pay", "Creating Apple Pay session", paymentRequest)

      if (!window.ApplePaySession) {
        logError("apple-pay", "Apple Pay session not available")
        throw new Error("Apple Pay is not available on this device")
      }

      const session = new window.ApplePaySession(3, paymentRequest)
      logDebug("apple-pay", "Apple Pay session created")

      session.onvalidatemerchant = async (event: any) => {
        try {
          logInfo("apple-pay", "Validating merchant", { validationURL: event.validationURL })

          // In a real implementation, you would call your server to validate the merchant
          // For demo purposes, we'll simulate a successful validation
          const merchantSession = {
            // This would come from your server after validating with Apple
            merchantSessionIdentifier: "merchant_session_identifier",
            nonce: "nonce",
            merchantIdentifier: "merchant_identifier",
            domainName: window.location.hostname,
            displayName: "Your Store Name",
          }

          logSuccess("apple-pay", "Merchant validated successfully")
          session.completeMerchantValidation(merchantSession)
        } catch (error) {
          logError("apple-pay", "Error validating merchant", error)
          session.abort()
        }
      }

      session.onpaymentauthorized = async (event: any) => {
        try {
          logInfo("apple-pay", "Payment authorized by user", {
            paymentToken: !!event.payment.token,
          })

          // Process the payment with Authorize.net
          const formData = new FormData()
          formData.append("dataDescriptor", "COMMON.APPLE.INAPP.PAYMENT")
          formData.append("dataValue", JSON.stringify(event.payment.token.paymentData))
          formData.append("amount", amount.toString())
          formData.append("paymentMethod", "apple-pay")
          formData.append("recipientId", recipientId)
          formData.append("recipientEmail", recipientEmail)
          formData.append("paymentDescription", paymentDescription)

          logInfo("apple-pay", "Processing payment on server", {
            amount,
            recipientId,
            paymentDescription,
          })

          const paymentResponse = await processAuthorizeNetPayment(formData)
          logDebug("apple-pay", "Received payment processing response", paymentResponse)

          if (paymentResponse.success) {
            logSuccess("apple-pay", "Payment processed successfully", {
              transactionId: paymentResponse.transactionId,
            })
            session.completePayment(window.ApplePaySession.STATUS_SUCCESS)
            onPaymentStatusChange("success")
          } else {
            logError("apple-pay", "Payment processing failed", {
              error: paymentResponse.error,
            })
            session.completePayment(window.ApplePaySession.STATUS_FAILURE)
            throw new Error(paymentResponse.error || "Payment processing failed")
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An error occurred processing your payment"
          logError("apple-pay", "Payment error", { error: errorMessage })
          session.completePayment(window.ApplePaySession.STATUS_FAILURE)
          onPaymentStatusChange("error")
          onError(errorMessage)
        }
      }

      session.oncancel = () => {
        logInfo("apple-pay", "Payment cancelled by user")
        onPaymentStatusChange("idle")
      }

      logInfo("apple-pay", "Beginning Apple Pay session")
      session.begin()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred processing your payment"
      logError("apple-pay", "Payment error", { error: errorMessage })
      onPaymentStatusChange("error")
      onError(errorMessage)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isApplePayAvailable) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Apple Pay is not available on this device or browser.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-center mb-4">Click the button below to pay with Apple Pay.</p>
      <Button onClick={handleApplePayClick} className="w-full">
        Pay ${amount.toFixed(2)} with Apple Pay
      </Button>
    </div>
  )
}
