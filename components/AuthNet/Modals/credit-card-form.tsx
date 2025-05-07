"use client";

import type React from "react";

import { useState } from "react";
import { useAcceptJs } from "react-acceptjs";
import { processAuthorizeNetPayment } from "@/lib/actions/authorize-net-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// Add import for the logger
import {
  logInfo,
  logError,
  logSuccess,
  logDebug,
} from "@/utils/payment-logger";

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
    apiLoginID: process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID || "",
    clientKey: process.env.NEXT_PUBLIC_AUTHORIZE_CLIENT_KEY || "",
  };

  const { dispatchData, loading, error } = useAcceptJs({ authData });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  // Inside the CreditCardForm component, update the handleSubmit function:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onPaymentStatusChange("processing");
    logInfo("credit-card", "Payment submission started", { amount });

    try {
      logDebug("credit-card", "Sending card data to Authorize.net");
      // Send card data to Authorize.net and get payment nonce
      const response = await dispatchData({ cardData });
      logDebug("credit-card", "Received response from Authorize.net", response);

      if (response.messages.resultCode === "Error") {
        const errorMessage = response.messages.message[0].text;
        logError("credit-card", "Authorize.net returned an error", {
          resultCode: response.messages.resultCode,
          message: errorMessage,
        });
        throw new Error(errorMessage);
      }

      logSuccess(
        "credit-card",
        "Successfully received payment nonce from Authorize.net"
      );

      // Create form data to send to server action
      const formData = new FormData();
      formData.append("dataDescriptor", response.opaqueData.dataDescriptor);
      formData.append("dataValue", response.opaqueData.dataValue);
      formData.append("amount", amount.toString());
      formData.append("paymentMethod", "credit-card");
      formData.append("recipientId", recipientId);
      formData.append("recipientEmail", recipientEmail);
      formData.append("paymentDescription", paymentDescription);

      logInfo("credit-card", "Processing payment on server", {
        amount,
        recipientId,
        paymentDescription,
      });

      // Process payment on the server
      const paymentResponse = await processAuthorizeNetPayment(formData);
      logDebug(
        "credit-card",
        "Received payment processing response",
        paymentResponse
      );

      if (paymentResponse.success) {
        logSuccess("credit-card", "Payment processed successfully", {
          transactionId: paymentResponse.transactionId,
        });
        onPaymentStatusChange("success");
      } else {
        logError("credit-card", "Payment processing failed", {
          error: paymentResponse.error,
        });
        throw new Error(paymentResponse.error || "Payment processing failed");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred processing your payment";
      logError("credit-card", "Payment error", { error: errorMessage });
      onPaymentStatusChange("error");
      onError(errorMessage);
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
