"use client";

import { useState } from "react";
import PaymentStatus from "./PaymentStatus";
import AcceptPaymentForm from "./AuthProcessForm";

export default function Home() {
  const [paymentStatus, setPaymentStatus] = useState<{
    success?: boolean;
    error?: string;
    transactionId?: string;
    message?: string;
  } | null>(null);

  const handlePaymentComplete = (result: any) => {
    console.log("Payment completed:", result);
    setPaymentStatus({
      success: true,
      transactionId: result.transactionId,
      message: result.message,
    });
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    setPaymentStatus({
      success: false,
      error: error,
    });
  };

  const resetPayment = () => {
    setPaymentStatus(null);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Authorize.Net Payment
      </h1>

      {paymentStatus ? (
        <PaymentStatus
          success={paymentStatus.success || false}
          error={paymentStatus.error}
          transactionId={paymentStatus.transactionId}
          onReset={resetPayment}
        />
      ) : (
        <AcceptPaymentForm
          onPaymentComplete={handlePaymentComplete}
          onPaymentError={handlePaymentError}
        />
      )}
    </div>
  );
}
