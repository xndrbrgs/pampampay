"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAcceptJs } from "react-acceptjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type AuthorizeNetPaymentTabProps = {
  amount: number
  recipientId: string
  paymentDescription: string
  recipientEmail: string
  onSuccess: () => void
  onError: (message: string) => void
}

export function AuthorizeNetPaymentTab({
  amount,
  recipientId,
  paymentDescription,
  recipientEmail,
  onSuccess,
  onError,
}: AuthorizeNetPaymentTabProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardData, setCardData] = useState({
    cardNumber: "",
    month: "",
    year: "",
    cardCode: "",
    zip: "",
  })
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    return month < 10 ? `0${month}` : `${month}`
  })

  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => `${currentYear + i}`)

  // Get environment variables
  const apiLoginID = process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID!
  const clientKey = process.env.NEXT_PUBLIC_AUTHORIZE_NET_CLIENT_KEY!

  const authorizenetConfig = {
    apiLoginID: apiLoginID,
    clientKey: clientKey,
    environment: "sandbox", // Change to "production" for live payments
  }

  const { dispatchData, loading, error } = useAcceptJs({ authorizenetConfig })

  // Monitor for errors from the useAcceptJs hook
  useEffect(() => {
    if (error) {
      console.error("Accept.js Error:", error)
      onError(error.message || "An error occurred with the payment processor")
    }
  }, [error, onError])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setCardData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setDebugInfo(null)

    // Validate environment variables
    if (!apiLoginID || !clientKey) {
      onError("Missing Authorize.net credentials. Please check your environment variables.")
      setIsProcessing(false)
      return
    }

    // Validate card data
    if (!cardData.cardNumber || !cardData.month || !cardData.year || !cardData.cardCode) {
      onError("Please fill in all card details")
      setIsProcessing(false)
      return
    }

    try {
      console.log("Dispatching data to Accept.js...")

      // Format the payload exactly as required by Accept.js
      const payload = {
        cardData: {
          cardNumber: cardData.cardNumber.replace(/\s/g, ""),
          month: cardData.month,
          year: cardData.year,
          cardCode: cardData.cardCode,
          zip: cardData.zip || "12345", // Provide a default zip if empty
          fullName: "Customer Name", // Required field
        },
      }

      console.log("Payload structure:", Object.keys(payload))
      console.log("Card data structure:", Object.keys(payload.cardData))

      const response = await dispatchData(payload)
      console.log("Accept.js response received")

      // For debugging
      if (response.messages && response.messages.resultCode === "Error") {
        setDebugInfo(response)
        onError(response.messages.message[0]?.text || "Payment processing failed")
        setIsProcessing(false)
        return
      }

      // Now send the payment nonce to your server
      console.log("Sending payment data to server...")
      const serverResponse = await processPayment({
        dataValue: response.opaqueData.dataValue,
        dataDescriptor: response.opaqueData.dataDescriptor,
        amount,
        description: paymentDescription,
        recipientEmail,
        recipientId,
      })

      console.log("Server response received")

      if (serverResponse.success) {
        onSuccess()
      } else {
        setDebugInfo(serverResponse)
        onError(serverResponse.message || "Payment processing failed")
      }
    } catch (err: any) {
      console.error("Payment processing error:", err)
      setDebugInfo(err.response || err)
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

  // For testing - use a valid test card
  const fillTestCard = () => {
    setCardData({
      cardNumber: "4111111111111111",
      month: "12",
      year: `${currentYear + 1}`,
      cardCode: "123",
      zip: "12345",
    })
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cardNumber">Card Number</Label>
          <div className="relative">
            <Input
              id="cardNumber"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardData.cardNumber}
              onChange={handleInputChange}
              required
              className="pl-10"
            />
            <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Select onValueChange={(value) => handleSelectChange("month", value)} value={cardData.month}>
              <SelectTrigger id="month">
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Select onValueChange={(value) => handleSelectChange("year", value)} value={cardData.year}>
              <SelectTrigger id="year">
                <SelectValue placeholder="YYYY" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardCode">CVV</Label>
            <Input
              id="cardCode"
              name="cardCode"
              placeholder="123"
              value={cardData.cardCode}
              onChange={handleInputChange}
              required
              maxLength={4}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip">Zip/Postal Code</Label>
          <Input id="zip" name="zip" placeholder="12345" value={cardData.zip} onChange={handleInputChange} required />
        </div>

        <div className="pt-4 space-y-2">
          <Button type="submit" className="w-full" disabled={isProcessing || loading}>
            {isProcessing || loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
          </Button>

          <Button type="button" variant="outline" className="w-full" onClick={fillTestCard}>
            Fill Test Card
          </Button>
        </div>
      </form>

      {debugInfo && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md text-xs">
          <p className="font-semibold">Debug Information:</p>
          <pre className="overflow-auto max-h-40 mt-2">
            {typeof debugInfo === "object" ? JSON.stringify(debugInfo, null, 2) : debugInfo}
          </pre>
        </div>
      )}
    </div>
  )
}
