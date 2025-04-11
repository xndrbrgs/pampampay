"use client"

import { GooglePayLoader } from "@/components/Auth.Net/wallets/GooglePayLoader"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface GooglePayContextType {
  isAvailable: boolean
  isLoading: boolean
  error: Error | null
  paymentsClient: any | null
}

const GooglePayContext = createContext<GooglePayContextType>({
  isAvailable: false,
  isLoading: true,
  error: null,
  paymentsClient: null,
})

export const useGooglePay = () => useContext(GooglePayContext)

interface GooglePayProviderProps {
  children: ReactNode
}

export function GooglePayProvider({ children }: GooglePayProviderProps) {
  const [isAvailable, setIsAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [paymentsClient, setPaymentsClient] = useState<any>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Initialize Google Pay client and check availability when script is loaded
  useEffect(() => {
    if (!scriptLoaded || typeof window === "undefined") return

    const initGooglePay = async () => {
      try {
        if (!window.google || !window.google.payments || !window.google.payments.api) {
          throw new Error("Google Pay API not available")
        }

        // Initialize Google Pay client
        const client = new window.google.payments.api.PaymentsClient({
          environment: process.env.NODE_ENV === "production" ? "PRODUCTION" : "TEST",
        })

        setPaymentsClient(client)

        // Check if Google Pay is available
        const response = await client.isReadyToPay({
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [
            {
              type: "CARD",
              parameters: {
                allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                allowedCardNetworks: ["AMEX", "DISCOVER", "MASTERCARD", "VISA"],
              },
            },
          ],
        })

        setIsAvailable(response.result)
        setIsLoading(false)
      } catch (err) {
        console.error("Error initializing Google Pay:", err)
        setError(err instanceof Error ? err : new Error("Failed to initialize Google Pay"))
        setIsLoading(false)
      }
    }

    initGooglePay()
  }, [scriptLoaded])

  const handleScriptLoad = () => {
    console.log("Google Pay script loaded in context")
    setScriptLoaded(true)
  }

  const handleScriptError = (err: Error) => {
    console.error("Google Pay script failed to load:", err)
    setError(err)
    setIsLoading(false)
  }

  return (
    <GooglePayContext.Provider value={{ isAvailable, isLoading, error, paymentsClient }}>
      <GooglePayLoader onLoad={handleScriptLoad} onError={handleScriptError} />
      {children}
    </GooglePayContext.Provider>
  )
}
