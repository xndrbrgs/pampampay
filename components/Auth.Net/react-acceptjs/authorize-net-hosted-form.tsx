"use client"

import { useState } from "react"
import { HostedForm } from "react-acceptjs"
import { Loader2 } from "lucide-react"

type AuthorizeNetHostedFormProps = {
  amount: number
  recipientId: string
  paymentDescription: string
  recipientEmail: string
  onSuccess: () => void
  onError: (message: string) => void
}

export function AuthorizeNetHostedForm({
  amount,
  recipientId,
  paymentDescription,
  recipientEmail,
  onSuccess,
  onError,
}: AuthorizeNetHostedFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  // Auth data for Authorize.net
  const authData = {
    apiLoginID: process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID || "",
    clientKey: process.env.NEXT_PUBLIC_AUTHORIZE_NET_CLIENT_KEY || "",
  }

  const handleSubmit = async (response: any) => {
    console.log("Received response:", response)
    setIsProcessing(true)

    try {
      if (response.messages && response.messages.resultCode === "Error") {
        const errorMessage = response.messages.message[0]?.text || "Payment processing failed"
        onError(errorMessage)
        setIsProcessing(false)
        return
      }

      // Now send the payment nonce to your server
      const serverResponse = await processPayment({
        dataValue: response.opaqueData.dataValue,
        dataDescriptor: response.opaqueData.dataDescriptor,
        amount,
        description: paymentDescription,
        recipientEmail,
        recipientId,
      })

      if (serverResponse.success) {
        onSuccess()
      } else {
        onError(serverResponse.message || "Payment processing failed")
      }
    } catch (err: any) {
      console.error("Payment processing error:", err)
      onError(err.message || "Payment processing failed")
    } finally {
      setIsProcessing(false)
    }
  }

  // This would be your actual server call
  const processPayment = async (paymentData: any) => {
    try {
      const response = await fetch("/api/payments/authorize-net", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Payment processing failed")
      }

      return await response.json()
    } catch (error: any) {
      console.error("Server API error:", error)
      throw new Error(error.message || "Payment processing failed")
    }
  }

  return (
    <div className="w-full z-[9999]">
      {isProcessing ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-center text-sm text-muted-foreground">Processing payment...</p>
        </div>
      ) : (
        <HostedForm
          authData={authData}
          onSubmit={handleSubmit}
          buttonText="Pay Now"
          formButtonText={`Pay $${amount.toFixed(2)}`}
          formHeaderText="Complete Your Payment"
          billingAddressOptions={{ show: true, required: true }}
          paymentOptions={{ showCreditCard: true, showBankAccount: false }}
          buttonStyle={{ width: "100%", padding: "10px", borderRadius: "4px", backgroundColor: "#000", color: "#fff" }}
        />
      )}
    </div>
  )
}
