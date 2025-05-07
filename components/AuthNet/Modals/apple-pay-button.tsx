"use client";

import { useEffect, useState } from "react";
import { processAuthorizeNetPayment } from "@/lib/actions/authorize-net-actions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    Accept: any;
    ApplePaySession: any;
  }
}

interface ApplePayButtonProps {
  amount: number;
  recipientId: string;
  recipientEmail: string;
  paymentDescription: string;
  onPaymentStatusChange: (
    status: "idle" | "processing" | "success" | "error"
  ) => void;
  onError: (message: string | null) => void;
}

export default function ApplePayButton({
  amount,
  recipientId,
  recipientEmail,
  paymentDescription,
  onPaymentStatusChange,
  onError,
}: ApplePayButtonProps) {
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Authorize.net Accept.js script
    const script = document.createElement("script");
    script.src = "https://js.authorize.net/v1/Accept.js";
    script.async = true;
    script.onload = checkApplePayAvailability;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const checkApplePayAvailability = () => {
    // Check if Apple Pay is available
    const isApplePayAvailable =
      window.ApplePaySession && window.ApplePaySession.canMakePayments();

    setIsApplePayAvailable(isApplePayAvailable);
    setIsLoading(false);
  };

  const handleApplePayClick = async () => {
    try {
      onPaymentStatusChange("processing");

      // Configure Apple Pay session
      const paymentRequest = {
        countryCode: "US",
        currencyCode: "USD",
        supportedNetworks: ["visa", "masterCard", "amex", "discover"],
        merchantCapabilities: ["supports3DS"],
        total: {
          label: "Your Store Name",
          amount: amount.toFixed(2),
        },
      };

      const session = new window.ApplePaySession(3, paymentRequest);

      session.onvalidatemerchant = async (event: any) => {
        try {
          // In a real implementation, you would call your server to validate the merchant
          // For demo purposes, we'll simulate a successful validation
          const merchantSession = {
            // This would come from your server after validating with Apple
            merchantSessionIdentifier: "merchant_session_identifier",
            nonce: "nonce",
            merchantIdentifier: "merchant_identifier",
            domainName: window.location.hostname,
            displayName: "Your Store Name",
          };

          session.completeMerchantValidation(merchantSession);
        } catch (error) {
          console.error("Error validating merchant:", error);
          session.abort();
        }
      };

      session.onpaymentauthorized = async (event: any) => {
        try {
          // Process the payment with Authorize.net
          const formData = new FormData();
          formData.append("dataDescriptor", "COMMON.APPLE.INAPP.PAYMENT");
          formData.append(
            "dataValue",
            JSON.stringify(event.payment.token.paymentData)
          );
          formData.append("amount", amount.toString());
          formData.append("paymentMethod", "apple-pay");
          formData.append("recipientId", recipientId);
          formData.append("recipientEmail", recipientEmail);
          formData.append("paymentDescription", paymentDescription);

          const paymentResponse = await processAuthorizeNetPayment(formData);

          if (paymentResponse.success) {
            session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
            onPaymentStatusChange("success");
          } else {
            session.completePayment(window.ApplePaySession.STATUS_FAILURE);
            throw new Error(
              paymentResponse.error || "Payment processing failed"
            );
          }
        } catch (error) {
          session.completePayment(window.ApplePaySession.STATUS_FAILURE);
          onPaymentStatusChange("error");
          onError(
            error instanceof Error
              ? error.message
              : "An error occurred processing your payment"
          );
        }
      };

      session.oncancel = () => {
        onPaymentStatusChange("idle");
      };

      session.begin();
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

  if (!isApplePayAvailable) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Apple Pay is not available on this device or browser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-center mb-4">
        Click the button below to pay with Apple Pay.
      </p>
      <Button onClick={handleApplePayClick} className="w-full">
        Pay ${amount.toFixed(2)} with Apple Pay
      </Button>
    </div>
  );
}
