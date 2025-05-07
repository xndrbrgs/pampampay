"use client";

import { useEffect, useState } from "react";
import { processAuthorizeNetPayment } from "@/lib/actions/authorize-net-actions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
// Add import for the logger
import {
  logInfo,
  logWarning,
  logError,
  logSuccess,
  logDebug,
} from "@/utils/payment-logger";

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

  // Update the useEffect hook for script loading
  useEffect(() => {
    logInfo("google-pay", "Initializing Google Pay");
    // Load Authorize.net Accept.js script
    const script = document.createElement("script");
    script.src = "https://js.authorize.net/v1/Accept.js";
    script.async = true;
    script.onload = () => {
      logSuccess("google-pay", "Authorize.net Accept.js loaded successfully");
      initializeGooglePay();
    };
    script.onerror = (error) => {
      logError("google-pay", "Failed to load Authorize.net Accept.js", error);
      setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      logInfo("google-pay", "Cleaning up Google Pay resources");
      document.body.removeChild(script);
    };
  }, []);

  // Update the initializeGooglePay function
  const initializeGooglePay = async () => {
    try {
      logInfo("google-pay", "Loading Google Pay API");
      // Load Google Pay API
      const googlePayScript = document.createElement("script");
      googlePayScript.src = "https://pay.google.com/gp/p/js/pay.js";
      googlePayScript.async = true;
      googlePayScript.onload = () => {
        logSuccess("google-pay", "Google Pay API loaded successfully");
        configureGooglePay();
      };
      googlePayScript.onerror = (error) => {
        logError("google-pay", "Failed to load Google Pay API", error);
        setIsLoading(false);
      };
      document.body.appendChild(googlePayScript);
    } catch (error) {
      logError("google-pay", "Error initializing Google Pay", error);
      setIsLoading(false);
    }
  };

  // Update the configureGooglePay function
  const configureGooglePay = async () => {
    try {
      logInfo("google-pay", "Configuring Google Pay client");

      if (
        !window.google ||
        !window.google.payments ||
        !window.google.payments.api
      ) {
        logError("google-pay", "Google Pay API not available on window object");
        setIsGooglePayAvailable(false);
        setIsLoading(false);
        return;
      }

      const googlePayClient = new window.google.payments.api.PaymentsClient({
        environment: "PRODUCTION", // Change to PRODUCTION for live environment
      });

      window.googlePayClient = googlePayClient;
      logDebug("google-pay", "Google Pay client created", {
        environment: "PRODUCTION",
      });

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

      logInfo(
        "google-pay",
        "Checking if Google Pay is available",
        isReadyToPayRequest
      );
      const isReadyToPayResponse = await googlePayClient.isReadyToPay(
        isReadyToPayRequest
      );

      if (isReadyToPayResponse.result) {
        logSuccess(
          "google-pay",
          "Google Pay is available on this device/browser"
        );
      } else {
        logWarning(
          "google-pay",
          "Google Pay is not available on this device/browser"
        );
      }

      setIsGooglePayAvailable(isReadyToPayResponse.result);
      setIsLoading(false);
    } catch (error) {
      logError("google-pay", "Error configuring Google Pay", error);
      setIsGooglePayAvailable(false);
      setIsLoading(false);
    }
  };

  // Update the handleGooglePayClick function
  const handleGooglePayClick = async () => {
    try {
      logInfo("google-pay", "Google Pay payment initiated", { amount });
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
                  process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID,
              },
            },
          },
        ],
        merchantInfo: {
          merchantId: "12345678901234567890",
          merchantName: "PamPamPay",
        },
        transactionInfo: {
          totalPriceStatus: "FINAL",
          totalPrice: amount.toFixed(2),
          currencyCode: "USD",
        },
      };

      logDebug(
        "google-pay",
        "Requesting payment data from Google Pay",
        paymentDataRequest
      );

      if (!window.googlePayClient) {
        logError("google-pay", "Google Pay client not initialized");
        throw new Error("Google Pay is not properly initialized");
      }

      const paymentData = await window.googlePayClient.loadPaymentData(
        paymentDataRequest
      );
      logSuccess("google-pay", "Received payment data from Google Pay", {
        paymentMethodType: paymentData.paymentMethodData.type,
      });

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

      logInfo("google-pay", "Processing payment on server", {
        amount,
        recipientId,
        paymentDescription,
      });

      const paymentResponse = await processAuthorizeNetPayment(formData);
      logDebug(
        "google-pay",
        "Received payment processing response",
        paymentResponse
      );

      if (paymentResponse.success) {
        logSuccess("google-pay", "Payment processed successfully", {
          transactionId: paymentResponse.transactionId,
        });
        onPaymentStatusChange("success");
      } else {
        logError("google-pay", "Payment processing failed", {
          error: paymentResponse.error,
        });
        throw new Error(paymentResponse.error || "Payment processing failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred processing your payment";
      logError("google-pay", "Payment error", { error: errorMessage });
      onPaymentStatusChange("error");
      onError(errorMessage);
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
