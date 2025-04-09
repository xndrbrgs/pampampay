"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { AuthorizeNetHosted } from "./authorize-net-hosted"

type AuthorizeNetPaymentModalProps = {
  isOpen: boolean
  onClose: () => void
  amount: number
  recipientId: string
  paymentDescription: string
  recipientEmail: string
}

export function AuthorizeNetPaymentModal({
  isOpen,
  onClose,
  amount,
  recipientId,
  paymentDescription,
  recipientEmail,
}: AuthorizeNetPaymentModalProps) {
  const [error, setError] = useState<string | null>(null)

  const handleSuccess = () => {
    const successAnimation = document.createElement("div")
    successAnimation.className = "fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
    successAnimation.innerHTML = `
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            class="p-6 bg-white rounded-lg shadow-lg text-center"
        >
            <h2 
                class="text-2xl font-bold text-black"
                style="opacity: 0; animation: fadeIn 0.5s forwards 0.2s;"
            >
                Payment Successful!
            </h2>
            <p 
                class="mt-2 text-gray-600"
                style="opacity: 0; animation: fadeIn 0.5s forwards 0.5s;"
            >
                Thank you for your payment.
            </p>
        </motion.div>
        <style>
            @keyframes fadeIn {
                to {
                    opacity: 1;
                }
            }
        </style>
    `

    document.body.appendChild(successAnimation)

    setTimeout(() => {
      document.body.removeChild(successAnimation)
    }, 3000)
    setError(null)
    onClose()
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] py-32">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="py-2">
          <div className="mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm md:text-xl text-muted-foreground">Amount:</span>
              <span className="font-medium md:text-xl">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm md:text-xl text-muted-foreground">Recipient:</span>
              <span className="font-medium md:text-xl">PamPamPay</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm md:text-xl text-muted-foreground">Description:</span>
              <span className="font-medium md:text-xl">{paymentDescription}</span>
            </div>
          </div>

          <AuthorizeNetHosted
            amount={amount}
            recipientId={recipientId}
            paymentDescription={paymentDescription}
            recipientEmail={recipientEmail}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
