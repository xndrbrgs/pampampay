"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { processDigitalWalletPayment } from "@/services/authdigitalwallets";
import { useGooglePay } from "@/contexts/googlepay";
import { Loader2 } from "lucide-react";

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
  const {
    isAvailable,
    isLoading: isClientLoading,
    paymentsClient,
    error: clientError,
  } = useGooglePay();
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const handleGooglePayment = async () => {
    if (!isAvailable || !paymentsClient) {
      onError("Google Pay is not available on this device or browser.");
      return;
    }

    setIsProcessing(true);
    let debug = "Starting Google Pay payment flow...\n";
    debug += `API Login ID: ${
      process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID
        ? "Present (masked)"
        : "Missing"
    }\n`;
    debug += `Merchant ID: ${
      process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID
        ? "Present (masked)"
        : "Missing"
    }\n`;

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
              billingAddressRequired: true,
              billingAddressParameters: {
                format: "FULL",
                phoneNumberRequired: true,
              },
            },
            tokenizationSpecification: {
              type: "PAYMENT_GATEWAY",
              parameters: {
                gateway: "authorizenet",
                gatewayMerchantId:
                  process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID || "",
              },
            },
          },
        ],
        merchantInfo: {
          merchantId: process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID || "",
          merchantName: "PamPamPay",
        },
        transactionInfo: {
          totalPriceStatus: "FINAL",
          totalPrice: amount.toFixed(2),
          currencyCode: "USD",
          countryCode: "US",
        },
      };

      debug += `Payment data request: ${JSON.stringify(
        paymentDataRequest,
        null,
        2
      )}\n`;
      setDebugInfo(debug);

      // Show Google Pay payment sheet
      debug += "Loading payment data...\n";
      setDebugInfo(debug);

      const paymentData = await paymentsClient.loadPaymentData(
        paymentDataRequest
      );

      debug += `Payment data received: ${JSON.stringify(
        paymentData,
        null,
        2
      )}\n`;
      setDebugInfo(debug);

      // Process the payment with Authorize.net
      debug += "Processing payment with Authorize.net...\n";
      setDebugInfo(debug);

      const result = await processDigitalWalletPayment({
        type: "google-pay",
        paymentData,
        amount,
        description: paymentDescription,
        recipientEmail,
        recipientId,
      });

      debug += `Payment result: ${JSON.stringify(result, null, 2)}\n`;
      setDebugInfo(debug);

      if (result.success) {
        setIsProcessing(false);
        onSuccess();
      } else {
        setIsProcessing(false);
        onError(result.message || "Payment failed");
      }
    } catch (error: any) {
      console.error("Google Pay error:", error);
      debug += `Error: ${error.message || "Unknown error"}\n`;

      if (error.statusCode) {
        debug += `Status code: ${error.statusCode}\n`;
      }

      if (error.statusMessage) {
        debug += `Status message: ${error.statusMessage}\n`;
      }

      setDebugInfo(debug);
      setIsProcessing(false);

      // Handle user cancellation differently
      if (error.statusCode === "CANCELED") {
        return;
      }

      onError(error.message || "Google Pay payment failed");
    }
  };

  if (isClientLoading) {
    return (
      <Button
        disabled
        className="w-full bg-white text-black border border-gray-300 flex items-center justify-center"
      >
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading Google Pay...
      </Button>
    );
  }

  if (clientError) {
    return (
      <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
        Failed to load Google Pay: {clientError.message}
      </div>
    );
  }

  if (!isAvailable) {
    return null; // Don't render the button if Google Pay is not available
  }

  return (
    <div>
      <Button
        onClick={handleGooglePayment}
        disabled={isProcessing}
        className="w-full bg-white text-black border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
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
        )}
        Pay with Google Pay
      </Button>

      {debugInfo && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
          <p className="font-semibold">Debug Information:</p>
          <pre>{debugInfo}</pre>
        </div>
      )}
    </div>
  );
}
