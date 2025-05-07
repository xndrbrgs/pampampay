"use client"

import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaymentSuccessProps {
  amount: number
  onClose: () => void
}

export default function PaymentSuccess({ amount, onClose }: PaymentSuccessProps) {
  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      <CheckCircle className="h-16 w-16 text-green-500" />
      <p className="text-xl font-semibold">${amount.toFixed(2)} paid successfully</p>
      <p className="text-muted-foreground text-center">
        Thank you for your payment. A receipt has been sent to your email.
      </p>
      <Button onClick={onClose} className="w-full">
        Close
      </Button>
    </div>
  )
}
