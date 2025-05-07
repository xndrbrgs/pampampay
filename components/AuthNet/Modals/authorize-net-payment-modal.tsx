"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentProvider } from "@/contexts/payment-context"
import CreditCardForm from "./credit-card-form"
import GooglePayButton from "./google-pay-button"
import ApplePayButton from "./apple-pay-button"
import PaymentSuccess from "./payment-success"
import PaymentError from "./payment-error"

interface AuthorizeNetPaymentModalProps {
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
  const [activeTab, setActiveTab] = useState("credit-card")
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Reset state when modal is closed
  const handleClose = () => {
    setPaymentStatus("idle")
    setErrorMessage(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay with Authorize.net</DialogTitle>
        </DialogHeader>

        <PaymentProvider>
          {paymentStatus === "success" ? (
            <PaymentSuccess amount={amount} onClose={handleClose} />
          ) : paymentStatus === "error" ? (
            <PaymentError errorMessage={errorMessage} onRetry={() => setPaymentStatus("idle")} />
          ) : (
            <Tabs defaultValue="credit-card" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  onPaymentStatusChange={setPaymentStatus}
                  onError={setErrorMessage}
                />
              </TabsContent>
              <TabsContent value="google-pay">
                <GooglePayButton
                  amount={amount}
                  recipientId={recipientId}
                  recipientEmail={recipientEmail}
                  paymentDescription={paymentDescription}
                  onPaymentStatusChange={setPaymentStatus}
                  onError={setErrorMessage}
                />
              </TabsContent>
              <TabsContent value="apple-pay">
                <ApplePayButton
                  amount={amount}
                  recipientId={recipientId}
                  recipientEmail={recipientEmail}
                  paymentDescription={paymentDescription}
                  onPaymentStatusChange={setPaymentStatus}
                  onError={setErrorMessage}
                />
              </TabsContent>
            </Tabs>
          )}
        </PaymentProvider>
      </DialogContent>
    </Dialog>
  )
}
