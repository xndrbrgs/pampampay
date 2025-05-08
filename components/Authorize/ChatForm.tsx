"use client";

import React from "react";
import { useAcceptJs } from "react-acceptjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type AuthorizeNetPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  recipientId: string;
  recipientEmail: string;
  paymentDescription: string;
};

export function ChatForm({
  isOpen,
  onClose,
  amount,
  recipientId,
  recipientEmail,
  paymentDescription,
}: AuthorizeNetPaymentModalProps) {
  const [cardNumber, setCardNumber] = React.useState("");
  const [expMonth, setExpMonth] = React.useState("");
  const [expYear, setExpYear] = React.useState("");
  const [cvv, setCvv] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const authData = {
    apiLoginID: process.env.AUTHORIZE_NET_API_LOGIN_ID!,
    clientKey: process.env.AUTHORIZE_NET_TRANSACTION_KEY!,
  };

  const { dispatchData } = useAcceptJs({
    authData,
    environment: "SANDBOX",
  });

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { opaqueData } = await dispatchData({
        cardData: {
          cardNumber,
          month: expMonth,
          year: expYear,
          cardCode: cvv,
        },
      });

      const res = await fetch("/api/payments/authorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          recipientId,
          recipientEmail,
          paymentDescription,
          opaqueData,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Payment failed");
      }

      toast("Payment Successful", {
        description: "Authorize.Net payment completed successfully.",
      });
      onClose();
    } catch (err: any) {
      toast("Payment Error", {
        description: err.message || "An error occurred during payment.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Authorize.Net Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="MM"
              value={expMonth}
              onChange={(e) => setExpMonth(e.target.value)}
            />
            <Input
              type="text"
              placeholder="YY"
              value={expYear}
              onChange={(e) => setExpYear(e.target.value)}
            />
            <Input
              type="text"
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="black"
            className="w-full"
          >
            {loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
