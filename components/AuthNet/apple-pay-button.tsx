"use client"

import { useEffect, useState } from "react"
import { usePayment } from "@/contexts/payment-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { processPayment } from "@/lib/actions/payment-actions"

declare global {
  interface Window {
    Accept: any
    ApplePaySession: any
  }
}

export default function ApplePayButton() {
  const { amount, paymentStatus, setPaymentStatus, setErrorMessage } = usePayment()
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load Authorize.net Accept.js script
    const script = document.createElement("script")
    script.src = "https://js.authorize.net/v1/Accept.js"
    script.async = true
    script.onload = checkApplePayAvailability
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const checkApplePayAvailability = () => {
    // Check if Apple Pay is available
    const isApplePayAvailable = window.ApplePaySession && window.ApplePaySession.canMakePayments()

    setIsApplePayAvailable(isApplePayAvailable)
    setIsLoading(false)
  }

  const handleApplePayClick = async () => {
    try {
      setPaymentStatus("processing")

      // Configure Apple Pay session
      const paymentRequest = {
        countryCode: "US",
        currencyCode: "USD",
        supportedNetworks: ["visa", "masterCard", "amex", "discover"],
        merchantCapabilities: ["supports3DS"],
        total: {
          label: "PamPamPay",
          amount: amount.toFixed(2),
        },
      }

      const session = new window.ApplePaySession(3, paymentRequest)

      session.onvalidatemerchant = async (event: any) => {
        try {
          // In a real implementation, you would call your server to validate the merchant
          // For demo purposes, we'll simulate a successful validation
          const merchantSession = {
            // This would come from your server after validating with Apple
            merchantSessionIdentifier: "merchant_session_identifier",
            nonce: "nonce",
            merchantIdentifier: "merchant_identifier",
            domainName: window.location.hostname,
            displayName: "PamPamPay",
          }

          session.completeMerchantValidation(merchantSession)
        } catch (error) {
          console.error("Error validating merchant:", error)
          session.abort()
        }
      }

      session.onpaymentauthorized = async (event: any) => {
        try {
          // Process the payment with Authorize.net
          const formData = new FormData()
          formData.append("dataDescriptor", "COMMON.APPLE.INAPP.PAYMENT")
          formData.append("dataValue", JSON.stringify(event.payment.token.paymentData))
          formData.append("amount", amount.toString())
          formData.append("paymentMethod", "apple-pay")

          const paymentResponse = await processPayment(formData)

          if (paymentResponse.success) {
            session.completePayment(window.ApplePaySession.STATUS_SUCCESS)
            setPaymentStatus("success")
          } else {
            session.completePayment(window.ApplePaySession.STATUS_FAILURE)
            throw new Error(paymentResponse.error || "Payment processing failed")
          }
        } catch (error) {
          session.completePayment(window.ApplePaySession.STATUS_FAILURE)
          setPaymentStatus("error")
          setErrorMessage(error instanceof Error ? error.message : "An error occurred processing your payment")
        }
      }

      session.oncancel = () => {
        setPaymentStatus("idle")
      }

      session.begin()
    } catch (error) {
      setPaymentStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An error occurred processing your payment")
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Apple Pay</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (!isApplePayAvailable) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Apple Pay</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Apple Pay is not available on this device or browser.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Apple Pay</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center mb-4">Click the button below to pay with Apple Pay.</p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleApplePayClick} className="w-full" disabled={paymentStatus === "processing"}>
          {paymentStatus === "processing" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${amount.toFixed(2)} with Apple Pay`
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
