"use client";

import { useEffect, useState } from "react";
import { usePayment } from "@/contexts/payment-context";
import { processPayment } from "@/lib/actions/payment-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    Accept: any;
    google: any;
    googlePayClient: any;
  }
}

export default function GooglePayButton() {
  const { amount, paymentStatus, setPaymentStatus, setErrorMessage } =
    usePayment();
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
        environment: "PRODUCTION", // Change to PRODUCTION for live environment
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
      setPaymentStatus("processing");

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
                  process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID!,
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

      const paymentResponse = await processPayment(formData);

      if (paymentResponse.success) {
        setPaymentStatus("success");
      } else {
        throw new Error(paymentResponse.error || "Payment processing failed");
      }
    } catch (error) {
      setPaymentStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An error occurred processing your payment"
      );
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Google Pay</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!isGooglePayAvailable) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Google Pay</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Google Pay is not available on this device or browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Google Pay</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center mb-4">
          Click the button below to pay with Google Pay.
        </p>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGooglePayClick}
          className="w-full"
          disabled={paymentStatus === "processing"}
        >
          {paymentStatus === "processing" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${amount.toFixed(2)} with Google Pay`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
