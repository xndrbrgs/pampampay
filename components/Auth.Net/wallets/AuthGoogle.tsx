"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  isGooglePayAvailable,
  processDigitalWalletPayment,
} from "@/services/authdigitalwallets";

type GooglePayButtonProps = {
  amount: number;
  recipientId: string;
  paymentDescription: string;
  recipientEmail: string;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export function GooglePayButton({
  amount,
  recipientId,
  paymentDescription,
  recipientEmail,
  onSuccess,
  onError,
}: GooglePayButtonProps) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentsClient, setPaymentsClient] = useState<any>(null);

  // Check if Google Pay is available
  useEffect(() => {
    const checkAvailability = async () => {
      const available = await isGooglePayAvailable();
      setIsAvailable(available);

      if (
        available &&
        window.google &&
        window.google.payments &&
        window.google.payments.api
      ) {
        // Initialize Google Pay client
        const client = new window.google.payments.api.PaymentsClient({
          environment:
            process.env.NODE_ENV === "production" ? "PRODUCTION" : "TEST",
        });
        setPaymentsClient(client);
      }
    };

    checkAvailability();
  }, []);

  const handleGooglePayment = async () => {
    if (!isAvailable || !paymentsClient) {
      onError("Google Pay is not available on this device or browser.");
      return;
    }

    setIsLoading(true);

    try {
      // Configure payment request
      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: "CARD",
            parameters: {
              allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
              allowedCardNetworks: ["AMEX", "DISCOVER", "MASTERCARD", "VISA"],
            },
            tokenizationSpecification: {
              type: "PAYMENT_GATEWAY",
              parameters: {
                gateway: "authorize.net",
                gatewayMerchantId:
                  process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID,
              },
            },
          },
        ],
        merchantInfo: {
          merchantId:
            process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID ||
            "12345678901234567890",
          merchantName: "Your Company Name",
        },
        transactionInfo: {
          totalPriceStatus: "FINAL",
          totalPrice: amount.toFixed(2),
          currencyCode: "USD",
          countryCode: "US",
        },
      };

      // Show Google Pay payment sheet
      const paymentData = await paymentsClient.loadPaymentData(
        paymentDataRequest
      );

      // Process the payment with Authorize.net
      const result = await processDigitalWalletPayment({
        type: "google-pay",
        paymentData,
        amount,
        description: paymentDescription,
        recipientEmail,
        recipientId,
      });

      if (result.success) {
        setIsLoading(false);
        onSuccess();
      } else {
        setIsLoading(false);
        onError(result.message || "Payment failed");
      }
    } catch (error: any) {
      console.error("Google Pay error:", error);
      setIsLoading(false);

      // Handle user cancellation differently
      if (error.statusCode === "CANCELED") {
        return;
      }

      onError(error.message || "Google Pay payment failed");
    }
  };

  if (!isAvailable) {
    return null; // Don't render the button if Google Pay is not available
  }

  return (
    <Button
      onClick={handleGooglePayment}
      disabled={isLoading}
      className="w-full bg-white text-black border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
    >
      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
        <path
          d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
          fill="white"
        />
        <path
          d="M17.5 10.1911V13.8089H16.6V10.1911H17.5ZM14.7 11.4H17.1V12.6H14.7V11.4ZM13.8 10.1911V13.8089H12.9V10.1911H13.8ZM11 11.4H13.4V12.6H11V11.4ZM10.1 10.1911V13.8089H9.2V10.1911H10.1ZM6.5 11.4H9.7V12.6H6.5V11.4Z"
          fill="#5F6368"
        />
        <path
          d="M6.5 13.8089L8.3 10.1911H9.3L7.5 13.8089H6.5ZM14.7 13.8089L16.5 10.1911H17.5L15.7 13.8089H14.7ZM11 13.8089L12.8 10.1911H13.8L12 13.8089H11Z"
          fill="#5F6368"
        />
      </svg>
      Pay with Google Pay
    </Button>
  );
}
