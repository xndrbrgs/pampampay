"use client";

import { useEffect, useState } from "react";
import { processAuthorizeNetPayment } from "@/lib/actions/authorize-net-actions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    Accept: any;
    google: any;
    googlePayClient: any;
  }
}

interface GooglePayButtonProps {
  amount: number;
  recipientId: string;
  recipientEmail: string;
  paymentDescription: string;
  onPaymentStatusChange: (
    status: "idle" | "processing" | "success" | "error"
  ) => void;
  onError: (message: string | null) => void;
}

export default function GooglePayButton({
  amount,
  recipientId,
  recipientEmail,
  paymentDescription,
  onPaymentStatusChange,
  onError,
}: GooglePayButtonProps) {
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Authorize.net Accept.js script
    const script = document.createElement("script");
    script.src = "https://js.authorize.net/v1/Accept.js";
    script.async = true;
    script.onload = initializeGooglePay;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeGooglePay = async () => {
    try {
      // Load Google Pay API
      const googlePayScript = document.createElement("script");
      googlePayScript.src = "https://pay.google.com/gp/p/js/pay.js";
      googlePayScript.async = true;
      googlePayScript.onload = configureGooglePay;
      document.body.appendChild(googlePayScript);
    } catch (error) {
      console.error("Error initializing Google Pay:", error);
      setIsLoading(false);
    }
  };

  const configureGooglePay = async () => {
    try {
      const googlePayClient = new window.google.payments.api.PaymentsClient({
        environment: "TEST", // Change to PRODUCTION for live environment
      });

      window.googlePayClient = googlePayClient;

      // Check if Google Pay is available
      const isReadyToPayRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: "CARD",
            parameters: {
              allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
              allowedCardNetworks: ["AMEX", "DISCOVER", "MASTERCARD", "VISA"],
            },
          },
        ],
      };

      const isReadyToPayResponse = await googlePayClient.isReadyToPay(
        isReadyToPayRequest
      );
      setIsGooglePayAvailable(isReadyToPayResponse.result);
      setIsLoading(false);
    } catch (error) {
      console.error("Error configuring Google Pay:", error);
      setIsLoading(false);
    }
  };

  const handleGooglePayClick = async () => {
    try {
      onPaymentStatusChange("processing");

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
                  process.env.NEXT_PUBLIC_AUTHORIZE_API_LOGIN_ID,
              },
            },
          },
        ],
        merchantInfo: {
          merchantId: "12345678901234567890",
          merchantName: "Your Store Name",
        },
        transactionInfo: {
          totalPriceStatus: "FINAL",
          totalPrice: amount.toFixed(2),
          currencyCode: "USD",
        },
      };

      const paymentData = await window.googlePayClient.loadPaymentData(
        paymentDataRequest
      );

      // Process the payment with Authorize.net
      const formData = new FormData();
      formData.append("dataDescriptor", "COMMON.GOOGLE.INAPP.PAYMENT");
      formData.append(
        "dataValue",
        paymentData.paymentMethodData.tokenizationData.token
      );
      formData.append("amount", amount.toString());
      formData.append("paymentMethod", "google-pay");
      formData.append("recipientId", recipientId);
      formData.append("recipientEmail", recipientEmail);
      formData.append("paymentDescription", paymentDescription);

      const paymentResponse = await processAuthorizeNetPayment(formData);

      if (paymentResponse.success) {
        onPaymentStatusChange("success");
      } else {
        throw new Error(paymentResponse.error || "Payment processing failed");
      }
    } catch (error) {
      onPaymentStatusChange("error");
      onError(
        error instanceof Error
          ? error.message
          : "An error occurred processing your payment"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isGooglePayAvailable) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Google Pay is not available on this device or browser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-center mb-4">
        Click the button below to pay with Google Pay.
      </p>
      <Button onClick={handleGooglePayClick} className="w-full">
        Pay ${amount.toFixed(2)} with Google Pay
      </Button>
    </div>
  );
}
