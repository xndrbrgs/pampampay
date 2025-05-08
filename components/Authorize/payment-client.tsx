"use client";

import { useState } from "react";
import { getFormToken } from "./actions/payment";
import PaymentForm from "./payment-form";

export default function PaymentClient() {
  const [formToken, setFormToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getFormToken({
        amount: "99.99",
        description: "Product purchase",
      });
      setFormToken(token);
    } catch (err) {
      setError("Failed to get payment token. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Complete Your Payment</h1>

      {!formToken ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Click below to proceed to our secure payment form.
          </p>
          <button
            onClick={handleGetToken}
            disabled={loading}
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm disabled:opacity-50"
          >
            {loading ? "Loading..." : "Continue to Payment"}
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      ) : (
        <PaymentForm formToken={formToken} />
      )}
    </div>
  );
}
