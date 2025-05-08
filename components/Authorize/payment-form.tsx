"use client";

import { useState } from "react";
import { AcceptHosted } from "react-acceptjs";
import { processPaymentResponse } from "./actions/payment";

interface PaymentFormProps {
  formToken: string;
}

export default function PaymentForm({ formToken }: PaymentFormProps) {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const handleTransactionResponse = async (response: any) => {
    setProcessing(true);
    try {
      const result = await processPaymentResponse(response);

      if (result.success) {
        setSuccess(true);
        setTransactionId(result.transactionId);
      } else {
        setError(result.message || "Payment failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while processing your payment.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    setError("Payment was cancelled.");
  };

  if (success) {
    return (
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <h2 className="text-xl font-semibold text-green-700 mb-2">
          Payment Successful!
        </h2>
        <p className="text-green-600 mb-4">
          Your payment has been processed successfully.
        </p>
        {transactionId && (
          <p className="text-sm text-green-600 mb-4">
            Transaction ID: {transactionId}
          </p>
        )}
        <button
          onClick={() => (window.location.href = "/")}
          className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div>
      {processing ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      ) : (
        <AcceptHosted
          formToken={formToken}
          integration="iframe"
          onTransactionResponse={handleTransactionResponse}
          onCancel={handleCancel}
          environment="SANDBOX" // Change to "PRODUCTION" for live payments
        >
          <AcceptHosted.Button className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm">
            Complete Payment
          </AcceptHosted.Button>
          <AcceptHosted.IFrameBackdrop className="fixed inset-0 bg-black bg-opacity-50 z-40" />
          <AcceptHosted.IFrameContainer className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-medium">Secure Payment</h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>
              <AcceptHosted.IFrame className="w-full h-[500px]" />
            </div>
          </AcceptHosted.IFrameContainer>
        </AcceptHosted>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
