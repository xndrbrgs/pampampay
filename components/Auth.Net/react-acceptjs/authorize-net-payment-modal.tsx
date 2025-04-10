"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { isApplePayAvailable, isGooglePayAvailable } from "@/services/authdigitalwallets"
import { AuthorizeNetAcceptHosted } from "./AcceptHosted"
import { GooglePayButton } from "../wallets/AuthGoogle"
import { ApplePayButton } from "../wallets/AuthApple"

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
  const [applePayAvailable, setApplePayAvailable] = useState(false)
  const [googlePayAvailable, setGooglePayAvailable] = useState(false)
  const [activeTab, setActiveTab] = useState("card")
  const [debugInfo, setDebugInfo] = useState<string>("")

  // Check for digital wallet availability
  useEffect(() => {
    // Debug info
    let debug = "Checking digital wallet availability...\n"

    // Check Apple Pay
    try {
      const appleAvailable = isApplePayAvailable()
      debug += `Apple Pay check result: ${appleAvailable}\n`
      debug += `ApplePaySession exists: ${typeof window !== "undefined" && !!window.ApplePaySession}\n`
      if (typeof window !== "undefined" && window.ApplePaySession) {
        debug += `canMakePayments exists: ${!!window.ApplePaySession.canMakePayments}\n`
        debug += `canMakePayments result: ${window.ApplePaySession.canMakePayments()}\n`
      }
      setApplePayAvailable(appleAvailable)
    } catch (err: any) {
      debug += `Apple Pay check error: ${err.message}\n`
    }

    // Check Google Pay
    try {
      debug += `Checking Google Pay...\n`
      debug += `Google object exists: ${typeof window !== "undefined" && !!window.google}\n`
      if (typeof window !== "undefined" && window.google) {
        debug += `Google payments exists: ${!!window.google.payments}\n`
        if (window.google.payments) {
          debug += `Google payments API exists: ${!!window.google.payments.api}\n`
        }
      }

      isGooglePayAvailable()
        .then((available) => {
          debug += `Google Pay check result: ${available}\n`
          setGooglePayAvailable(available)
          setDebugInfo(debug)
        })
        .catch((err) => {
          debug += `Google Pay check error: ${err.message}\n`
          setDebugInfo(debug)
        })
    } catch (err: any) {
      debug += `Google Pay check error: ${err.message}\n`
      setDebugInfo(debug)
    }
  }, [])

  const handleSuccess = () => {
    const successAnimation = document.createElement("div")
    successAnimation.className = "fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
    successAnimation.innerHTML = `
        <div class="p-6 bg-white rounded-lg shadow-lg text-center">
            <h2 class="text-2xl font-bold text-black" style="opacity: 0; animation: fadeIn 0.5s forwards 0.2s;">
                Payment Successful!
            </h2>
            <p class="mt-2 text-gray-600" style="opacity: 0; animation: fadeIn 0.5s forwards 0.5s;">
                Thank you for your payment.
            </p>
        </div>
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

  // Force enable tabs for testing (remove in production)
  const forceEnableWallets = () => {
    setApplePayAvailable(true)
    setGooglePayAvailable(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
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

          {/* Debug information */}
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
            <p className="font-semibold">Digital Wallet Availability:</p>
            <p>Apple Pay: {applePayAvailable ? "Available" : "Not Available"}</p>
            <p>Google Pay: {googlePayAvailable ? "Available" : "Not Available"}</p>
            <button onClick={forceEnableWallets} className="text-blue-500 underline mt-2">
              Force Enable Wallets (Testing Only)
            </button>
            <pre className="mt-2 text-gray-600">{debugInfo}</pre>
          </div>

          <Tabs defaultValue="card" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList
              className="grid w-full"
              style={{
                gridTemplateColumns: `repeat(${1 + (applePayAvailable ? 1 : 0) + (googlePayAvailable ? 1 : 0)}, 1fr)`,
              }}
            >
              <TabsTrigger value="card">Credit Card</TabsTrigger>
              {applePayAvailable && <TabsTrigger value="apple-pay">Apple Pay</TabsTrigger>}
              {googlePayAvailable && <TabsTrigger value="google-pay">Google Pay</TabsTrigger>}
            </TabsList>

            <TabsContent value="card" className="mt-4">
              <AuthorizeNetAcceptHosted
                amount={amount}
                recipientId={recipientId}
                paymentDescription={paymentDescription}
                recipientEmail={recipientEmail}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </TabsContent>

            {applePayAvailable && (
              <TabsContent value="apple-pay" className="mt-4">
                <ApplePayButton
                  amount={amount}
                  recipientId={recipientId}
                  paymentDescription={paymentDescription}
                  recipientEmail={recipientEmail}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              </TabsContent>
            )}

            {googlePayAvailable && (
              <TabsContent value="google-pay" className="mt-4">
                <GooglePayButton
                  amount={amount}
                  recipientId={recipientId}
                  paymentDescription={paymentDescription}
                  recipientEmail={recipientEmail}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
