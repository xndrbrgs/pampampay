"use client";

import { useState } from "react";
import {
  CreditCard,
  GooglePay,
  CashAppPay,
  PaymentForm,
} from "react-square-web-payments-sdk";
import { motion } from "framer-motion";
import { processSquarePayment } from "@/lib/actions/square.actions";

export type PaymentMethod = "card" | "google-pay" | "apple-pay" | "cash-app";

type SquarePaymentTabProps = {
  paymentMethod: PaymentMethod;
  amount: number;
  recipientId: string;
  paymentDescription: string;
  recipientEmail: string;
  onSuccess: () => void;
  onError: (error: string) => void;
};

export function SquarePaymentTab({
  paymentMethod,
  amount,
  recipientId,
  paymentDescription,
  recipientEmail,
  onSuccess,
  onError,
}: SquarePaymentTabProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Convert amount to cents for Square
  const amountInCents = Math.round(amount * 100);

  const handlePaymentFormSubmit = async (
    token: string,
    buyer: Record<string, any>
  ) => {
    setIsLoading(true);

    try {
      // Use the server action to process the payment
      const result = await processSquarePayment({
        sourceId: token,
        amount,
        recipientId,
        paymentDescription,
        buyerEmail: buyer?.email || recipientEmail,
      });

      if (!result.success) {
        throw new Error(result.message || "Payment processing failed");
      }

      onSuccess();
    } catch (error) {
      console.error("Payment error:", error);
      onError(
        error instanceof Error ? error.message : "Payment processing failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // This function is required for digital wallets (Google Pay, Apple Pay, Cash App)
  const createPaymentRequest = () => {
    return {
      countryCode: "US",
      currencyCode: "USD",
      lineItems: [
        {
          amount: amount.toString(),
          label: paymentDescription || "Transfer",
          pending: false,
          id: "ITEM-001", // Example ID, replace with actual item ID if applicable
          imageUrl: "https://example.com/item-image.jpg", //Example URL, replace with actual item image URL if applicable
          productUrl: "https://example.com/item", //Example URL, replace with actual item product URL if applicable
        },
      ],
      taxLineItems: [
        {
          label: "Estimated Tax",
          amount: "0.00", // Replace with calculated tax amount
          pending: false,
        },
      ],
      discounts: [
        {
          label: "No Discount",
          amount: "0.00",
          pending: false,
        },
      ],
      requestBillingContact: true,
      requestShippingContact: false,
      shippingOptions: [],
      total: {
        amount: amount.toString(),
        label: `Payment to PamPamPay`,
      },
      note: `Transfer to ${recipientId}`,
      intent: "CHARGE",
    };
  };

  return (
    <>
      {!isLoading && (
        <PaymentForm
          applicationId={process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!}
          locationId={process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!}
          cardTokenizeResponseReceived={(token, buyer) => {
            if (token?.token) {
              handlePaymentFormSubmit(token.token, buyer ?? {});
            } else {
              onError("Token is undefined");
            }
          }}
          createPaymentRequest={createPaymentRequest}
        >
          <div>
            <CreditCard />
          </div>
          <div className="mt-2">
            <GooglePay />
          </div>
          <div className="mt-2 items-center flex justify-center">
            <CashAppPay values="light" />
          </div>
        </PaymentForm>
      )}
      {isLoading && (
        <div className="flex justify-center items-center h-16 mt-5">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
        </div>
      )}
    </>
  );
}
