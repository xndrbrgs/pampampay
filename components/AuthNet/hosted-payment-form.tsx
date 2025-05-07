"use client";
import { HostedForm } from "react-acceptjs";
import { usePayment } from "@/contexts/payment-context";
import { processPayment } from "@/lib/actions/payment-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HostedPaymentForm() {
  const { amount, setPaymentStatus, setErrorMessage } = usePayment();

  const authData = {
    apiLoginID: process.env.NEXT_PUBLIC_AUTHORIZE_API_LOGIN_ID || "",
    clientKey: process.env.NEXT_PUBLIC_AUTHORIZE_CLIENT_KEY || "",
  };

  const handleSubmit = async (response: any) => {
    try {
      if (response.messages.resultCode === "Error") {
        throw new Error(response.messages.message[0].text);
      }

      // Create form data to send to server action
      const formData = new FormData();
      formData.append("dataDescriptor", response.opaqueData.dataDescriptor);
      formData.append("dataValue", response.opaqueData.dataValue);
      formData.append("amount", amount.toString());
      formData.append("paymentMethod", "credit-card");

      // Process payment on the server
      const paymentResponse = await processPayment(formData);

      if (paymentResponse.success) {
        setPaymentStatus("success");
      } else {
        throw new Error(paymentResponse.error || "Payment processing failed");
      }
    } catch (err) {
      setPaymentStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An error occurred processing your payment"
      );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Hosted Payment Form</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <HostedForm
          authData={authData}
          onSubmit={handleSubmit}
          formButtonText={`Pay $${amount.toFixed(2)}`}
          formHeaderText="Payment Information"
          buttonText="Open Payment Form"
          billingAddressOptions={{ show: true, required: true }}
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
      </CardContent>
    </Card>
  );
}
