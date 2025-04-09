"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type AuthorizeNetDirectIframeProps = {
  amount: number
  recipientId: string
  paymentDescription: string
  recipientEmail: string
  onSuccess: () => void
  onError: (message: string) => void
}

export function AuthorizeNetDirectIframe({
  amount,
  recipientId,
  paymentDescription,
  recipientEmail,
  onSuccess,
  onError,
}: AuthorizeNetDirectIframeProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [showIframe, setShowIframe] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

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

          // Handle communication success
          if (response.action === "successfulSave" || response.action === "transactionSuccessful") {
            onSuccess()
          }

          // Handle communication error
          if (response.action === "cancel" || response.action === "error") {
            onError(response.message || "Payment was cancelled or failed")
            setShowIframe(false)
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

  const openIframe = () => {
    setShowIframe(true)
  }

  const closeIframe = () => {
    setShowIframe(false)
  }

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

  // Determine the correct URL based on environment
//   const iframeUrl =
//     process.env.NODE_ENV === "production"
//       ? `https://accept.authorize.net/payment/payment?token=${token}`
//       : `https://test.authorize.net/payment/payment?token=${token}`
  const iframeUrl =
    process.env.NODE_ENV === "production"
      ? `https://test.authorize.net/payment/payment?token=${token}`
      : `https://test.authorize.net/payment/payment?token=${token}`

  return (
    <div className="w-full">
      {!showIframe ? (
        <Button onClick={openIframe} className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800">
          Pay ${amount.toFixed(2)}
        </Button>
      ) : (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeIframe}></div>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl z-[10000] relative">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Complete Your Payment</h3>
              <button onClick={closeIframe} className="text-gray-500 hover:text-gray-700" aria-label="Close">
                ✕
              </button>
            </div>
            <iframe
              ref={iframeRef}
              src={iframeUrl}
              height={600}
              width="100%"
              frameBorder="0"
              scrolling="no"
              title="Authorize.net Payment Form"
              style={{ minHeight: "600px" }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
