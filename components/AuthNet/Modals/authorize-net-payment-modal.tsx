"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentProvider } from "@/contexts/payment-context"
import CreditCardForm from "./credit-card-form"
import GooglePayButton from "./google-pay-button"
import ApplePayButton from "./apple-pay-button"
import PaymentSuccess from "./payment-success"
import PaymentError from "./payment-error"
// Add import for the logger
import { logInfo, logError } from "@/utils/payment-logger"
// Add import for the debug panel
import { PaymentDebugPanel } from "../payment-debug-panel"

interface AuthorizeNetPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  recipientId: string
  paymentDescription: string
  recipientEmail: string
}

// Add logging to the component
export function AuthorizeNetPaymentModal({
  isOpen,
  onClose,
  amount,
  recipientId,
  paymentDescription,
  recipientEmail,
}: AuthorizeNetPaymentModalProps) {
  const [activeTab, setActiveTab] = useState("credit-card")
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Log when the modal is opened
  useEffect(() => {
    if (isOpen) {
      logInfo("general", "Authorize.net payment modal opened", {
        amount,
        recipientId,
        paymentDescription,
      })
    }
  }, [isOpen, amount, recipientId, paymentDescription])

  // Reset state when modal is closed
  const handleClose = () => {
    logInfo("general", "Authorize.net payment modal closed", {
      finalStatus: paymentStatus,
    })
    setPaymentStatus("idle")
    setErrorMessage(null)
    onClose()
  }

  // Log tab changes
  const handleTabChange = (tab: string) => {
    logInfo("general", `Payment method changed to ${tab}`)
    setActiveTab(tab)
  }

  // Log payment status changes
  const handlePaymentStatusChange = (status: "idle" | "processing" | "success" | "error") => {
    logInfo("general", `Payment status changed to ${status}`)
    setPaymentStatus(status)
  }

  // Log error messages
  const handleError = (message: string | null) => {
    if (message) {
      logError("general", "Payment error occurred", { message })
    }
    setErrorMessage(message)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pay with Authorize.net</DialogTitle>
          </DialogHeader>

          <PaymentProvider>
            {paymentStatus === "success" ? (
              <PaymentSuccess amount={amount} onClose={handleClose} />
            ) : paymentStatus === "error" ? (
              <PaymentError errorMessage={errorMessage} onRetry={() => handlePaymentStatusChange("idle")} />
            ) : (
              <Tabs defaultValue="credit-card" value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="credit-card">Credit Card</TabsTrigger>
                  <TabsTrigger value="google-pay">Google Pay</TabsTrigger>
                  <TabsTrigger value="apple-pay">Apple Pay</TabsTrigger>
                </TabsList>
                <TabsContent value="credit-card">
                  <CreditCardForm
                    amount={amount}
                    recipientId={recipientId}
                    recipientEmail={recipientEmail}
                    paymentDescription={paymentDescription}
                    onPaymentStatusChange={handlePaymentStatusChange}
                    onError={handleError}
                  />
                </TabsContent>
                <TabsContent value="google-pay">
                  <GooglePayButton
                    amount={amount}
                    recipientId={recipientId}
                    recipientEmail={recipientEmail}
                    paymentDescription={paymentDescription}
                    onPaymentStatusChange={handlePaymentStatusChange}
                    onError={handleError}
                  />
                </TabsContent>
                <TabsContent value="apple-pay">
                  <ApplePayButton
                    amount={amount}
                    recipientId={recipientId}
                    recipientEmail={recipientEmail}
                    paymentDescription={paymentDescription}
                    onPaymentStatusChange={handlePaymentStatusChange}
                    onError={handleError}
                  />
                </TabsContent>
              </Tabs>
            )}
          </PaymentProvider>
        </DialogContent>
      </Dialog>
      <PaymentDebugPanel />
    </>
  )
}
