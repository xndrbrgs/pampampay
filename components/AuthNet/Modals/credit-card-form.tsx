"use client";

import type React from "react";

import { useState } from "react";
import { useAcceptJs } from "react-acceptjs";
import { processAuthorizeNetPayment } from "@/lib/actions/authorize-net-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

type CardData = {
  cardNumber: string;
  month: string;
  year: string;
  cardCode: string;
};

interface CreditCardFormProps {
  amount: number;
  recipientId: string;
  recipientEmail: string;
  paymentDescription: string;
  onPaymentStatusChange: (
    status: "idle" | "processing" | "success" | "error"
  ) => void;
  onError: (message: string | null) => void;
}

export default function CreditCardForm({
  amount,
  recipientId,
  recipientEmail,
  paymentDescription,
  onPaymentStatusChange,
  onError,
}: CreditCardFormProps) {
  const [cardData, setCardData] = useState<CardData>({
    cardNumber: "",
    month: "",
    year: "",
    cardCode: "",
  });

  // Get Authorize.net credentials from environment variables
  const authData = {
    apiLoginID: process.env.NEXT_PUBLIC_AUTHORIZE_API_LOGIN_ID || "",
    clientKey: process.env.NEXT_PUBLIC_AUTHORIZE_CLIENT_KEY || "",
  };

  const { dispatchData, loading, error } = useAcceptJs({ authData });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onPaymentStatusChange("processing");

    try {
      // Send card data to Authorize.net and get payment nonce
      const response = await dispatchData({ cardData });

      if (response.messages.resultCode === "Error") {
        throw new Error(response.messages.message[0].text);
      }

      // Create form data to send to server action
      const formData = new FormData();
      formData.append("dataDescriptor", response.opaqueData.dataDescriptor);
      formData.append("dataValue", response.opaqueData.dataValue);
      formData.append("amount", amount.toString());
      formData.append("paymentMethod", "credit-card");
      formData.append("recipientId", recipientId);
      formData.append("recipientEmail", recipientEmail);
      formData.append("paymentDescription", paymentDescription);

      // Process payment on the server
      const paymentResponse = await processAuthorizeNetPayment(formData);

      if (paymentResponse.success) {
        onPaymentStatusChange("success");
      } else {
        throw new Error(paymentResponse.error || "Payment processing failed");
      }
    } catch (err) {
      onPaymentStatusChange("error");
      onError(
        err instanceof Error
          ? err.message
          : "An error occurred processing your payment"
      );
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardData.cardNumber}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                name="month"
                placeholder="MM"
                value={cardData.month}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                name="year"
                placeholder="YYYY"
                value={cardData.year}
                onChange={handleInputChange}
                required
              />
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
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || error || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
