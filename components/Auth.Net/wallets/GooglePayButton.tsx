// components/GooglePayButton.tsx
import { useEffect } from "react";

interface GooglePayButtonProps {
  amount: number;
}

export default function GooglePayButton({ amount }: GooglePayButtonProps) {
  useEffect(() => {
    const addScript = () => {
      const script = document.createElement("script");
      script.src = "https://pay.google.com/gp/p/js/pay.js";
      script.async = true;
      script.onload = () => {
        if (window.google) {
          onGooglePayLoaded();
        }
      };
      document.body.appendChild(script);
    };

    const onGooglePayLoaded = () => {
      const paymentsClient = getGooglePaymentsClient();
      paymentsClient
        .isReadyToPay(getGoogleIsReadyToPayRequest())
        .then((response: any) => {
          if (response.result) {
            addGooglePayButton(paymentsClient);
          }
        })
        .catch(console.error);
    };

    const addGooglePayButton = (paymentsClient: any) => {
      const button = paymentsClient.createButton({
        onClick: onGooglePaymentButtonClicked,
        buttonSizeMode: "fill",
      });
      const container = document.getElementById("google-pay-button-container");
      if (container && !container.hasChildNodes()) {
        container.appendChild(button);
      }
    };

    const onGooglePaymentButtonClicked = () => {
      const paymentDataRequest = getGooglePaymentDataRequest();
      const paymentsClient = getGooglePaymentsClient();
      paymentsClient
        .loadPaymentData(paymentDataRequest)
        .then((paymentData: any) => processPayment(paymentData))
        .catch(console.error);
    };

    const processPayment = async (paymentData: any) => {
      const token = paymentData.paymentMethodData.tokenizationData.token;
      console.log("Google Pay Token:", token);

      // Call your Next.js API route
      const res = await fetch("/api/authorize-net/google-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      console.log("Server response:", data);
    };

    // Google Pay Configuration Helpers
    const getGooglePaymentsClient = () => {
      if (
        window.google &&
        window.google.payments &&
        window.google.payments.api
      ) {
        return new window.google.payments.api.PaymentsClient({
          environment: "PRODUCTION",
        });
      }
      throw new Error("Google Pay API is not available.");
    };

    const getGoogleIsReadyToPayRequest = () => ({
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [baseCardPaymentMethod],
    });

    const getGooglePaymentDataRequest = () => ({
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [cardPaymentMethod],
      transactionInfo: {
        countryCode: "US",
        currencyCode: "USD",
        totalPriceStatus: "FINAL",
        totalPrice: amount,
      },
      merchantInfo: {
        merchantId: process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID!,
      },
    });

    const allowedCardNetworks = [
      "AMEX",
      "DISCOVER",
      "INTERAC",
      "JCB",
      "MASTERCARD",
      "VISA",
    ];
    const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

    const baseCardPaymentMethod = {
      type: "CARD",
      parameters: {
        allowedAuthMethods: allowedCardAuthMethods,
        allowedCardNetworks: allowedCardNetworks,
      },
    };

    const cardPaymentMethod = {
      ...baseCardPaymentMethod,
      tokenizationSpecification: {
        type: "PAYMENT_GATEWAY",
        parameters: {
          gateway: "authorizenet", // Replace with "authorize.net" if applicable
          gatewayMerchantId: process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID!,
        },
      },
    };

    addScript();
  }, []);

  return <div id="google-pay-button-container" />;
}
