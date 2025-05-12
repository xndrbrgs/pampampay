"use client";

import { useState } from "react";
import PaymentStatus from "./PaymentStatus";
import AcceptPaymentForm from "./AuthProcessForm";

export default function PaymentWrapperAuth() {
  const [paymentStatus, setPaymentStatus] = useState<{
    success: boolean;
    transactionId?: string;
    error?: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSubmit = async (
    dataDescriptor: string,
    dataValue: string,
    amount: string
  ) => {
    setIsProcessing(true);

    try {
      console.log("Submitting payment with:", {
        dataDescriptor,
        dataValue,
        amount,
      });

      const response = await fetch("/api/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataDescriptor,
          dataValue,
          amount,
        }),
      });

      const result = await response.json();
      console.log("Payment result:", result);

      if (response.ok) {
        setPaymentStatus({
          success: true,
          transactionId: result.transactionId,
        });
      } else {
        setPaymentStatus({
          success: false,
          error: result.error || "Payment processing failed",
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus({
        success: false,
        error: "An unexpected error occurred",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetPayment = () => {
    setPaymentStatus(null);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Payment Processing
          </h1>

          {paymentStatus ? (
            <PaymentStatus
              success={paymentStatus.success}
              transactionId={paymentStatus.transactionId}
              error={paymentStatus.error}
              onReset={resetPayment}
            />
          ) : (
            <AcceptPaymentForm
              onSubmit={handlePaymentSubmit}
              isProcessing={isProcessing}
            />
          )}
        </div>
      </div>
    </main>
  );
}
