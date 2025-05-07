"use client"

import { useEffect, useState, useCallback } from "react"
import { getHostedPaymentPageToken } from "@/lib/actions/authorize-net-actions"
import { Loader2 } from "lucide-react"
import { logInfo, logError, logSuccess } from "@/utils/payment-logger"
import { Button } from "@/components/ui/button"

interface SimplifiedAcceptHostedProps {
  amount: number
  recipientId: string
  recipientEmail: string
  paymentDescription: string
  onPaymentStatusChange: (status: "idle" | "processing" | "success" | "error") => void
  onError: (message: string | null) => void
}

export default function SimplifiedAcceptHosted({
  amount,
  recipientId,
  recipientEmail,
  paymentDescription,
  onPaymentStatusChange,
  onError,
}: SimplifiedAcceptHostedProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [formToken, setFormToken] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Memoize callbacks to prevent infinite loops
  const handlePaymentStatusChange = useCallback(
    (status: "idle" | "processing" | "success" | "error") => {
      onPaymentStatusChange(status)
    },
    [onPaymentStatusChange],
  )

  const handleError = useCallback(
    (message: string | null) => {
      onError(message)
    },
    [onError],
  )

  // Get the token when the component mounts
  useEffect(() => {
    let isMounted = true

    const fetchToken = async () => {
      try {
        logInfo("accept-hosted", "Requesting hosted payment page token", {
          amount,
          paymentDescription,
          recipientEmail,
        })

        setIsLoading(true)
        handlePaymentStatusChange("processing")

        // Call the server action to get a token
        const response = await getHostedPaymentPageToken(amount, paymentDescription, recipientEmail)

        if (!isMounted) return

        if (response && response.token) {
          logSuccess("accept-hosted", "Hosted payment page token received", { token: response.token })
          setFormToken(response.token)
          handlePaymentStatusChange("idle")
        } else {
          throw new Error("Invalid token response")
        }
      } catch (error) {
        if (!isMounted) return

        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        logError("accept-hosted", "Error getting hosted payment page token", { error: errorMessage })
        handleError(errorMessage)
        handlePaymentStatusChange("error")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchToken()

    return () => {
      isMounted = false
    }
  }, [amount, paymentDescription, recipientEmail, handlePaymentStatusChange, handleError])

  // Simulate payment processing
  const handlePayment = async () => {
    try {
      logInfo("accept-hosted", "Processing payment", { amount, formToken })
      setIsProcessing(true)
      handlePaymentStatusChange("processing")

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate successful payment
      logSuccess("accept-hosted", "Payment processed successfully", {
        transactionId: `SIM-${Date.now()}`,
      })
      handlePaymentStatusChange("success")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      logError("accept-hosted", "Payment error", { error: errorMessage })
      handlePaymentStatusChange("error")
      handleError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-center">Initializing secure payment form...</span>
      </div>
    )
  }

  if (!formToken) {
    return (
      <div className="text-center py-4 text-red-500">
        <p>Unable to initialize payment form. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">Complete your payment securely through Authorize.net</p>
        <p className="text-xs text-muted-foreground mt-1">Token: {formToken}</p>
      </div>

      <Button onClick={handlePayment} disabled={isProcessing} className="w-full">
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${amount.toFixed(2)} Securely`
        )}
      </Button>
    </div>
  )
}
