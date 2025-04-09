"use client"

import { useState, useEffect } from "react"
import { AcceptHosted } from "react-acceptjs"
import { Loader2 } from "lucide-react"

type AuthorizeNetHostedProps = {
  amount: number
  recipientId: string
  paymentDescription: string
  recipientEmail: string
  onSuccess: () => void
  onError: (message: string) => void
}

export function AuthorizeNetHosted({
  amount,
  recipientId,
  paymentDescription,
  recipientEmail,
  onSuccess,
  onError,
}: AuthorizeNetHostedProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const getHostedPaymentPageToken = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/payments/authorize-net/get-hosted-page", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            description: paymentDescription,
            recipientEmail,
            recipientId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to get payment page")
        }

        const data = await response.json()
        if (data.success && data.token) {
          setToken(data.token)
        } else {
          throw new Error(data.message || "Failed to get payment token")
        }
      } catch (error: any) {
        console.error("Error getting hosted payment page token:", error)
        onError(error.message || "Failed to initialize payment form")
      } finally {
        setIsLoading(false)
      }
    }

    getHostedPaymentPageToken()
  }, [amount, paymentDescription, recipientEmail, recipientId, onError])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-center text-sm text-muted-foreground">Preparing secure payment form...</p>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <p className="text-sm text-red-600">Unable to load the payment form. Please try again later.</p>
      </div>
    )
  }

  // Configuration for the AcceptHosted component
  const authorizenetConfig = {
    environment: process.env.NODE_ENV === "production" ? "production" : "sandbox",
  }

  // Callback functions for the AcceptHosted component
  const onTransactionSuccess = () => {
    onSuccess()
  }

  const onTransactionError = (error: any) => {
    onError(error.message || "Payment processing failed")
  }

  const onClose = () => {
    onError("Payment was cancelled")
  }

  return (
    <div className="w-full">
      <AcceptHosted
        authData={{
          apiLoginID: process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID!,
          clientKey: process.env.NEXT_PUBLIC_AUTHORIZE_NET_CLIENT_KEY!,
        }}
        authorizenetConfig={authorizenetConfig}
        formToken={token}
        onTransactionSuccess={onTransactionSuccess}
        onTransactionError={onTransactionError}
        onClose={onClose}
        iFrameHeight={700}
        iFrameWidth="100%"
        className="w-full"
      />
    </div>
  )
}
