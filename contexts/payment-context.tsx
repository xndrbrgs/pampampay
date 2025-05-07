"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type PaymentMethod = "credit-card" | "google-pay" | "apple-pay"

interface PaymentContextType {
  selectedMethod: PaymentMethod | null
  amount: number
  setSelectedMethod: (method: PaymentMethod | null) => void
  setAmount: (amount: number) => void
  paymentStatus: "idle" | "processing" | "success" | "error"
  setPaymentStatus: (status: "idle" | "processing" | "success" | "error") => void
  errorMessage: string | null
  setErrorMessage: (message: string | null) => void
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  return (
    <PaymentContext.Provider
      value={{
        selectedMethod,
        setSelectedMethod,
        amount,
        setAmount,
        paymentStatus,
        setPaymentStatus,
        errorMessage,
        setErrorMessage,
      }}
    >
      {children}
    </PaymentContext.Provider>
  )
}

export function usePayment() {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error("usePayment must be used within a PaymentProvider")
  }
  return context
}
