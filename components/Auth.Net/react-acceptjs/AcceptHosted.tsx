"use client"

import { useState, useEffect } from "react"
import { AcceptHosted } from "react-acceptjs"
import { Loader2 } from "lucide-react"

type AuthorizeNetAcceptHostedProps = {
  amount: number
  recipientId: string
  paymentDescription: string
  recipientEmail: string
  onSuccess: () => void
  onError: (message: string) => void
}

export function AuthorizeNetAcceptHosted({
  amount,
  recipientId,
  paymentDescription,
  recipientEmail,
  onSuccess,
  onError,
}: AuthorizeNetAcceptHostedProps) {
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

  const handleTransactionResponse = (response: any) => {
    console.log("Transaction response:", response)
    if (response && response.transactionResponse && response.transactionResponse.responseCode === "1") {
      onSuccess()
    } else {
      const errorMessage =
        response && response.transactionResponse
          ? response.transactionResponse.message || "Payment failed"
          : "Payment processing failed"
      onError(errorMessage)
    }
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

  return (
    <div className="w-full">
      <AcceptHosted
        formToken={token}
        integration="iframe"
        onTransactionResponse={handleTransactionResponse}
        onCancel={() => onError("Payment was cancelled")}
        onSuccessfulSave={() => console.log("Successful save")}
        onResize={(width, height) => console.log(`Resize: ${width}x${height}`)}
      >
        <AcceptHosted.Button className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800">
          Pay ${amount.toFixed(2)}
        </AcceptHosted.Button>
        <AcceptHosted.IFrameBackdrop className="fixed inset-0 bg-black bg-opacity-50 z-40" />
        <AcceptHosted.IFrameContainer className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <AcceptHosted.IFrame className="w-[40vw] h-full z-30" />
          </div>
        </AcceptHosted.IFrameContainer>
      </AcceptHosted>
    </div>
  )
}
