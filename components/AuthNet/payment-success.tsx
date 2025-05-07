"use client"

import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { usePayment } from "@/contexts/payment-context"

export default function PaymentSuccess() {
  const { amount, setPaymentStatus, setSelectedMethod } = usePayment()

  const handleNewPayment = () => {
    setPaymentStatus("idle")
    setSelectedMethod(null)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Payment Successful</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <p className="text-xl font-semibold">${amount.toFixed(2)} paid successfully</p>
        <p className="text-muted-foreground text-center">
          Thank you for your payment. A receipt has been sent to your email.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleNewPayment} className="w-full">
          Make Another Payment
        </Button>
      </CardFooter>
    </Card>
  )
}
