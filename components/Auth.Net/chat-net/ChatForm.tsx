"use client";

import { useState } from "react";
import { FormContainer } from "react-authorize-net";

export default function ChatForm() {
  const [submitted, setSubmitted] = useState(false);
  const [responseData, setResponseData] = useState(null);

  const apiLoginId = process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID!;
  const clientKey = process.env.NEXT_PUBLIC_AUTHORIZE_NET_CLIENT_KEY!;

  const handleSuccess = async (response: any) => {
    console.log("Nonce received:", response);

    try {
      const res = await fetch("/api/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opaqueData: response.opaqueData,
          amount: 0.5,
        }),
      });

      const data = await res.json();
      setResponseData(data);
      setSubmitted(true);
    } catch (error) {
      console.error("Payment processing error:", error);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Authorize.Net Payment Demo</h1>

      {!submitted ? (
        <FormContainer
          clientKey={clientKey}
          apiLoginId={apiLoginId}
          amount={0.5}
          environment="production"
          onSuccess={handleSuccess}
          onError={(errors) => {
            console.error("Error:", errors);
          }}
          render={({ values, handleChange, validationErrors, apiErrors }) => (
            <form className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4">
              <input
                className="w-full border p-2 rounded"
                type="text"
                placeholder="Card Number"
                value={values.cardNumber}
                onChange={(e) => handleChange("cardNumber", e)}
              />
              {validationErrors.cardNumber && (
                <p className="text-red-500 text-sm">Invalid card number</p>
              )}

              <input
                className="w-full border p-2 rounded"
                type="text"
                placeholder="Expiration (MMYY)"
                value={values.expDate}
                onChange={(e) => handleChange("expDate", e)}
              />
              {validationErrors.expDate && (
                <p className="text-red-500 text-sm">Invalid expiration date</p>
              )}

              <input
                className="w-full border p-2 rounded"
                type="text"
                placeholder="CVV"
                value={values.cardCode}
                onChange={(e) => handleChange("cardCode", e)}
              />
              {validationErrors.cardCode && (
                <p className="text-red-500 text-sm">Invalid CVV</p>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-2 rounded"
              >
                Pay $0.50
              </button>

              {apiErrors.length > 0 &&
                apiErrors.map((err, idx) => (
                  <p key={idx} className="text-red-500 text-sm">
                    {err}
                  </p>
                ))}
            </form>
          )}
        />
      ) : (
        <div className="bg-green-100 p-4 rounded shadow-md">
          <h2 className="text-xl font-semibold">Payment successful!</h2>
          <pre className="mt-2 text-sm text-gray-700">
            {JSON.stringify(responseData, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
