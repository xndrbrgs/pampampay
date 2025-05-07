"use client";

import { useState } from "react";
import { AcceptHosted } from "react-acceptjs";
import { processAuthorizeNetPayment } from "@/lib/actions/authorize-net-actions";
import { Loader2 } from "lucide-react";
import {
  logInfo,
  logError,
  logSuccess,
  logDebug,
} from "@/utils/payment-logger";

interface HostedPaymentFormProps {
  amount: number;
  recipientId: string;
  recipientEmail: string;
  paymentDescription: string;
  onPaymentStatusChange: (
    status: "idle" | "processing" | "success" | "error"
  ) => void;
  onError: (message: string | null) => void;
}

export default function HostedPaymentForm({
  amount,
  recipientId,
  recipientEmail,
  paymentDescription,
  onPaymentStatusChange,
  onError,
}: HostedPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Get Authorize.net credentials from environment variables
  const authData = {
    apiLoginID: process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID || "",
    clientKey: process.env.NEXT_PUBLIC_AUTHORIZE_NET_CLIENT_KEY || "",
  };

  // Configuration for the hosted payment page
  const hostedPaymentConfig = {
    formId: "payment-form",
    formToken: "",
    showReceipt: false,
  };

  // Styling for the hosted payment page
  const hostedPaymentStyles = {
    bgColor: "white",
    buttonColor: "hsl(var(--primary))",
    buttonFontColor: "white",
    buttonText: `Pay $${amount.toFixed(2)}`,
    fontFamily: "system-ui, sans-serif",
    fontColor: "black",
    fontSize: "14px",
  };

  // Handle the "Get Token" button click
  const handleGetToken = async () => {
    setIsLoading(true);
    logInfo("hosted-form", "Initiating hosted payment form", { amount });

    // In a real implementation, you would call your server to get a token
    // For demo purposes, we'll simulate a successful token retrieval
    setTimeout(() => {
      setIsLoading(false);
      logSuccess("hosted-form", "Token retrieved successfully");
    }, 1000);
  };

  // Handle the payment submission
  const handleSubmit = async (response: any) => {
    try {
      logInfo("hosted-form", "Hosted payment form submitted", { response });
      onPaymentStatusChange("processing");

      if (response.messages.resultCode === "Error") {
        const errorMessage = response.messages.message[0].text;
        logError("hosted-form", "Authorize.net returned an error", {
          resultCode: response.messages.resultCode,
          message: errorMessage,
        });
        throw new Error(errorMessage);
      }

      logSuccess(
        "hosted-form",
        "Successfully received payment data from hosted form"
      );

      // Create form data to send to server action
      const formData = new FormData();
      formData.append("dataDescriptor", response.opaqueData.dataDescriptor);
      formData.append("dataValue", response.opaqueData.dataValue);
      formData.append("amount", amount.toString());
      formData.append("paymentMethod", "hosted-form");
      formData.append("recipientId", recipientId);
      formData.append("recipientEmail", recipientEmail);
      formData.append("paymentDescription", paymentDescription);

      logInfo("hosted-form", "Processing payment on server", {
        amount,
        recipientId,
        paymentDescription,
      });

      // Process payment on the server
      const paymentResponse = await processAuthorizeNetPayment(formData);
      logDebug(
        "hosted-form",
        "Received payment processing response",
        paymentResponse
      );

      if (paymentResponse.success) {
        logSuccess("hosted-form", "Payment processed successfully", {
          transactionId: paymentResponse.transactionId,
        });
        onPaymentStatusChange("success");
      } else {
        logError("hosted-form", "Payment processing failed", {
          error: paymentResponse.error,
        });
        throw new Error(paymentResponse.error || "Payment processing failed");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred processing your payment";
      logError("hosted-form", "Payment error", { error: errorMessage });
      onPaymentStatusChange("error");
      onError(errorMessage);
    }
  };

  // Handle errors from the hosted payment form
  const handleError = (error: any) => {
    logError("hosted-form", "Hosted payment form error", error);
    onPaymentStatusChange("error");
    onError(error.message || "An error occurred with the payment form");
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground mb-2">
          You'll be redirected to Authorize.net's secure payment page to
          complete your payment.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          <AcceptHosted
            authData={authData}
            config={hostedPaymentConfig}
            styles={hostedPaymentStyles}
            onSubmit={handleSubmit}
            onError={handleError}
            amount={amount.toFixed(2)}
            buttonText="Pay Securely"
            formHeaderText={`Payment: $${amount.toFixed(2)}`}
            billingAddressOptions={{ show: true, required: false }}
            paymentOptions={{ showCreditCard: true, showBankAccount: false }}
            buttonStyle={{
              padding: "10px 20px",
              backgroundColor: "hsl(var(--primary))",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
              width: "100%",
            }}
          />
        </div>
      )}
    </div>
  );
}
