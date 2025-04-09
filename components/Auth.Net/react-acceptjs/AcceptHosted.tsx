"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

type AcceptHostedProps = {
  amount: number
  recipientId: string
  paymentDescription: string
  recipientEmail: string
  onSuccess: () => void
  onError: (message: string) => void
}

export function AcceptHosted({
  amount,
  recipientId,
  paymentDescription,
  recipientEmail,
  onSuccess,
  onError,
}: AcceptHostedProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [iframeHeight, setIframeHeight] = useState(600)

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

  // Handle iframe messages from Authorize.net
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify the origin of the message
      if (event.origin.includes("authorize.net")) {
        try {
          const response = JSON.parse(event.data)

          // Handle resize messages
          if (response.height) {
            setIframeHeight(response.height)
          }

          // Handle transaction response
          if (response.transactionResponse) {
            if (response.transactionResponse.responseCode === "1") {
              // Transaction approved
              onSuccess()
            } else {
              // Transaction declined or error
              onError(response.transactionResponse.message || "Payment failed")
            }
          }
        } catch (error) {
          // Not a JSON message or other error
          console.log("Non-JSON message received from iframe")
        }
      }
    }

    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [onSuccess, onError])

  // For demo purposes, simulate a successful payment
  const simulateSuccessfulPayment = () => {
    onSuccess()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-center text-sm text-muted-foreground">Preparing secure payment form...</p>
      </div>
    )
  }

  // In a real implementation, this would use the actual token
  // For now, we'll show a simulation button
  return (
    <div className="flex flex-col">
      {token ? (
        <>
          <div className="mb-4 border rounded-md p-4 bg-gray-50">
            <p className="text-sm text-muted-foreground mb-2">
              In a production environment, this would display the Authorize.net hosted payment form in an iframe:
            </p>
            <code className="text-xs bg-gray-100 p-1 rounded">
              {`<iframe src="https://test.authorize.net/payment/payment?token=${token}" height="${iframeHeight}" width="100%" />`}
            </code>
          </div>

          <Button onClick={simulateSuccessfulPayment} className="w-full">
            Simulate Successful Payment
          </Button>
        </>
      ) : (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <p className="text-sm text-red-600">Unable to load the payment form. Please try again later.</p>
        </div>
      )}
    </div>
  )
}
