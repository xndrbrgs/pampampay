"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAcceptJs } from "react-acceptjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, CreditCard } from "lucide-react"
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type AuthorizeNetAcceptJsProps = {
  amount: number
  paymentDescription: string
  recipientEmail: string
  recipientId: string
  onCancel: () => void
  onSuccess: () => void
  className?: string
}

export function AuthorizeNetAcceptJs({
  amount,
  paymentDescription,
  recipientEmail,
  recipientId,
  onCancel,
  onSuccess,
  className = "",
}: AuthorizeNetAcceptJsProps) {
  const [isPaid, setIsPaid] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
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
    apiLoginID: process.env.AUTHORIZENET_API_LOGIN_ID || "",
    clientKey: process.env.AUTHORIZENET_TRANSACTION_KEY || "",
    environment: "sandbox", // Change to "production" for live payments
  }

  const { dispatchData, loading, error } = useAcceptJs({ authorizenetConfig })

  useEffect(() => {
    if (error) {
      setErrorMessage(error.message || "An error occurred with the payment processor")
    }
  }, [error])

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
    setErrorMessage(null)

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
        setIsPaid(true)
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        setErrorMessage(serverResponse.message || "Payment processing failed")
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Payment processing failed")
    } finally {
      setIsProcessing(false)
    }
  }

  // This would be your actual server call
  const processPayment = async (paymentData: any) => {
    // In a real implementation, you would call your API endpoint
    // For now, we'll simulate a successful response
    return { success: true, transactionId: "test-" + Date.now() }
  }

  if (errorMessage) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
        <Card className="border-red-500 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Payment Failed</h2>
              <p className="text-red-500 mb-6">{errorMessage}</p>
              <div className="flex space-x-4">
                <Button onClick={() => setErrorMessage(null)} variant="default">
                  Try Again
                </Button>
                <Button onClick={onCancel} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (isPaid) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Payment Received</h2>
              <p className="mb-6">Thank you for your payment. Your transaction has been completed successfully.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`w-full ${className}`}>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">Payment Amount: ${amount.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground">Description: {paymentDescription}</p>
      </div>

      <Card>
        <CardContent className="pt-6">
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
              <Input
                id="zip"
                name="zip"
                placeholder="12345"
                value={cardData.zip}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={isProcessing || loading}>
                {isProcessing || loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={onCancel}
                disabled={isProcessing || loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
