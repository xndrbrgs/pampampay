"use client";

import { useState, type FormEvent } from "react";
import Script from "next/script";

interface AcceptPaymentFormProps {
  onSubmit: (dataDescriptor: string, dataValue: string, amount: string) => void;
  isProcessing: boolean;
}

declare global {
  interface Window {
    Accept: {
      dispatch: (callback: () => void) => void;
      dispatchData: (data: any, callback: (response: any) => void) => void;
    };
  }
}

export default function AcceptPaymentForm({
  onSubmit,
  isProcessing,
}: AcceptPaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [cardCode, setCardCode] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!scriptLoaded) {
      setErrorMessage(
        "Payment processing is not ready yet. Please try again in a moment."
      );
      return;
    }

    // Validate amount format
    const amountValue = Number.parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setErrorMessage("Please enter a valid amount");
      return;
    }

    // Create the payment data object for tokenization
    const secureData = {
      authData: {
        clientKey: process.env.NEXT_PUBLIC_AUTHORIZE_NET_CLIENT_KEY!,
        apiLoginID: process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID!,
      },
      cardData: {
        cardNumber,
        month: expirationDate.substring(0, 2),
        year: expirationDate.substring(2),
        cardCode,
      },
    };

    // Send the payment data to Accept.js for tokenization
    window.Accept.dispatchData(secureData, (response) => {
      if (response.messages.resultCode === "Error") {
        let errorMessage = "Payment Error: ";
        for (let i = 0; i < response.messages.message.length; i++) {
          errorMessage += `${response.messages.message[i].text} `;
        }
        setErrorMessage(errorMessage);
      } else {
        // If successful, submit the payment nonce to your server
        // Ensure we're passing the dataDescriptor, dataValue, and amount as separate values
        onSubmit(
          response.opaqueData.dataDescriptor,
          response.opaqueData.dataValue,
          amount
        );
      }
    });
  };

  return (
    <>
      <Script
        src="https://js.authorize.net/v1/Accept.js"
        onLoad={() => setScriptLoaded(true)}
        strategy="lazyOnload"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {errorMessage}
          </div>
        )}

        <div>
          <label
            htmlFor="cardNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Card Number
          </label>
          <input
            type="text"
            id="cardNumber"
            placeholder="4111111111111111"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            For testing, use 4111111111111111
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="expirationDate"
              className="block text-sm font-medium text-gray-700"
            >
              Expiration Date (MMYY)
            </label>
            <input
              type="text"
              id="expirationDate"
              placeholder="1225"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="cardCode"
              className="block text-sm font-medium text-gray-700"
            >
              CVV
            </label>
            <input
              type="text"
              id="cardCode"
              placeholder="123"
              value={cardCode}
              onChange={(e) => setCardCode(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Amount ($)
          </label>
          <input
            type="text"
            id="amount"
            placeholder="10.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isProcessing || !scriptLoaded}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {isProcessing
            ? "Processing..."
            : scriptLoaded
            ? "Pay Now"
            : "Loading Payment System..."}
        </button>
      </form>
    </>
  );
}
