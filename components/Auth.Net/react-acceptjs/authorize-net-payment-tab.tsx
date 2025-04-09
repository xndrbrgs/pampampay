"use client"

import type React from "react"

import { useState } from "react"
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

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    return month < 10 ? `0${month}` : `${month}`
  })

  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => `${currentYear + i}`)

  const authorizenetConfig = {
    apiLoginID: process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID || "",
    clientKey: process.env.NEXT_PUBLIC_AUTHORIZE_NET_CLIENT_KEY || "",
    environment: "sandbox", // Change to "production" for live payments
  }

  const { dispatchData, loading, error } = useAcceptJs({ authorizenetConfig })

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

    if (error) {
      onError(error.message || "An error occurred with the payment processor")
      setIsProcessing(false)
      return
    }

    const payload = {
      cardData: {
        cardNumber: cardData.cardNumber.replace(/\s/g, ""),
        month: cardData.month,
        year: cardData.year,
        cardCode: cardData.cardCode,
        zip: cardData.zip,
        fullName: "Customer", // You could add a name field if needed
      },
    }

    try {
      const response = await dispatchData(payload)

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
      throw new Error(error.message || "Payment processing failed")
    }
  }

  return (
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

      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={isProcessing || loading}>
          {isProcessing || loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  )
}
