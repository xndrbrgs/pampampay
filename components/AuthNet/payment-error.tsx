"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { usePayment } from "@/contexts/payment-context"

export default function PaymentError() {
  const { errorMessage, setPaymentStatus, setErrorMessage } = usePayment()

  const handleTryAgain = () => {
    setPaymentStatus("idle")
    setErrorMessage(null)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Payment Failed</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <AlertCircle className="h-16 w-16 text-red-500" />
        <p className="text-muted-foreground text-center">
          {errorMessage || "There was an error processing your payment. Please try again."}
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleTryAgain} className="w-full">
          Try Again
        </Button>
      </CardFooter>
    </Card>
  )
}
