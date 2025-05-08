"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getFormToken, processPaymentResponse } from "./actions/payment"
import { AcceptHosted } from "react-acceptjs"
import { toast } from "sonner"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AuthorizeNetPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  recipientId: string
  recipientEmail: string
  paymentDescription: string
}

export function TestAuthForm({
  isOpen,
  onClose,
  amount,
  recipientId,
  recipientEmail,
  paymentDescription,
}: AuthorizeNetPaymentModalProps) {
  const [formToken, setFormToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Get form token when modal opens
  useEffect(() => {
    if (isOpen && !formToken && !loading && !success) {
      getToken()
    }
  }, [isOpen, retryCount])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormToken(null)
      setError(null)
      setSuccess(false)
      setRetryCount(0)
    }
  }, [isOpen])

  const getToken = async () => {
    setLoading(true)
    setError(null)
    try {
      // Format amount to 2 decimal places and ensure it's a string
      const formattedAmount = typeof amount === "number" ? amount.toFixed(2) : "0.00"

      // Use a simple invoice number format
      const invoiceNumber = `INV${Date.now().toString().slice(-8)}`

      // Get the token without passing customer ID
      const token = await getFormToken({
        amount: formattedAmount,
        description: paymentDescription || "Payment",
        invoiceNumber,
      })

      if (token) {
        setFormToken(token)
      } else {
        setError("No token received from payment gateway")
      }
    } catch (err) {
      console.error("Error in getToken:", err)
      setError(err instanceof Error ? err.message : "Failed to initialize payment form. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionResponse = async (response: any) => {
    setProcessing(true)
    try {
      // Add recipient info to the response for processing
      const enhancedResponse = {
        ...response,
        recipientId,
        recipientEmail,
        paymentDescription,
        amount: typeof amount === "number" ? amount.toFixed(2) : "0.00",
      }

      const result = await processPaymentResponse(enhancedResponse)

      if (result.success) {
        setSuccess(true)
        toast.success("Payment Successful", {
          description: `Your payment of $${typeof amount === "number" ? amount.toFixed(2) : "0.00"} has been processed successfully.`,
        })

        // Close modal after a short delay
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setError(result.message || "Payment failed. Please try again.")
        toast.error("Payment Failed", {
          description: result.message || "Your payment could not be processed. Please try again.",
        })
      }
    } catch (err) {
      console.error("Error in handleTransactionResponse:", err)
      setError("An error occurred while processing your payment.")
      toast.error("Payment Error", {
        description: "An unexpected error occurred. Please try again later.",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleCancel = () => {
    if (!processing) {
      onClose()
    }
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !processing && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Secure Payment</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center text-sm text-muted-foreground">Initializing secure payment form...</p>
          </div>
        ) : error && !formToken ? (
          <div className="flex flex-col items-center justify-center py-6">
            <AlertCircle className="h-8 w-8 text-destructive mb-4" />
            <p className="text-center text-sm text-destructive mb-4">{error}</p>
            <div className="flex gap-2">
              <Button onClick={handleRetry} variant="outline" disabled={loading}>
                Try Again
              </Button>
              <Button onClick={onClose} variant="ghost" disabled={loading}>
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              If this issue persists, please contact support.
            </p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-center font-medium text-green-600 mb-1">Payment Successful!</p>
            <p className="text-center text-sm text-muted-foreground mb-4">
              Your payment of ${typeof amount === "number" ? amount.toFixed(2) : "0.00"} has been processed.
            </p>
          </div>
        ) : formToken ? (
          <div className="py-4">
            <div className="mb-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Amount: <span className="font-medium">${typeof amount === "number" ? amount.toFixed(2) : "0.00"}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Description: <span className="font-medium">{paymentDescription}</span>
              </p>
            </div>

            {processing ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-center text-sm text-muted-foreground">Processing your payment...</p>
              </div>
            ) : (
              <AcceptHosted
                formToken={formToken}
                integration="iframe"
                onTransactionResponse={handleTransactionResponse}
                onCancel={handleCancel}
                environment="SANDBOX" // Change to "PRODUCTION" for live payments
              >
                <AcceptHosted.Button className="w-full py-2 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md">
                  Complete Payment
                </AcceptHosted.Button>
                <AcceptHosted.IFrameBackdrop className="fixed inset-0 bg-black bg-opacity-50 z-50" />
                <AcceptHosted.IFrameContainer className="fixed inset-0 flex items-center justify-center z-50 p-4">
                  <div className="bg-background rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="font-medium">Secure Payment Form</h3>
                      <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
                        ✕
                      </button>
                    </div>
                    <AcceptHosted.IFrame className="w-full h-[500px]" />
                  </div>
                </AcceptHosted.IFrameContainer>
              </AcceptHosted>
            )}

            {error && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                {error}
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
