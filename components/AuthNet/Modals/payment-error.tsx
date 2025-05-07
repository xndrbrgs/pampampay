"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaymentErrorProps {
  errorMessage: string | null
  onRetry: () => void
}

export default function PaymentError({ errorMessage, onRetry }: PaymentErrorProps) {
  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      <AlertCircle className="h-16 w-16 text-red-500" />
      <p className="text-muted-foreground text-center">
        {errorMessage || "There was an error processing your payment. Please try again."}
      </p>
      <Button onClick={onRetry} className="w-full">
        Try Again
      </Button>
    </div>
  )
}
