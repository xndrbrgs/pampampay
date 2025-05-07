"use client"

import { usePayment } from "@/contexts/payment-context"
import { CreditCard } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import Image from "next/image"

export default function PaymentMethodSelector() {
  const { selectedMethod, setSelectedMethod } = usePayment()

  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl font-semibold">Select Payment Method</h2>

      <RadioGroup
        value={selectedMethod || ""}
        onValueChange={(value) => setSelectedMethod(value as any)}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div>
          <RadioGroupItem value="credit-card" id="credit-card" className="peer sr-only" />
          <Label
            htmlFor="credit-card"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <CreditCard className="mb-3 h-6 w-6" />
            Credit Card
          </Label>
        </div>

        <div>
          <RadioGroupItem value="google-pay" id="google-pay" className="peer sr-only" />
          <Label
            htmlFor="google-pay"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <div className="mb-3 h-6 w-20 relative">
              <Image
                src="/placeholder.svg?height=24&width=80"
                alt="Google Pay"
                width={80}
                height={24}
                className="object-contain"
              />
            </div>
            Google Pay
          </Label>
        </div>

        <div>
          <RadioGroupItem value="apple-pay" id="apple-pay" className="peer sr-only" />
          <Label
            htmlFor="apple-pay"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <div className="mb-3 h-6 w-20 relative">
              <Image
                src="/placeholder.svg?height=24&width=80"
                alt="Apple Pay"
                width={80}
                height={24}
                className="object-contain"
              />
            </div>
            Apple Pay
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}
