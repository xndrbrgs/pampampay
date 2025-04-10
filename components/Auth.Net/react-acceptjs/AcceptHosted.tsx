"use client";

import { useState, useEffect } from "react";
import { AcceptHosted } from "react-acceptjs";
import { Loader2 } from "lucide-react";

type AuthorizeNetAcceptHostedProps = {
  amount: number;
  recipientId: string;
  paymentDescription: string;
  recipientEmail: string;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export function AuthorizeNetAcceptHosted({
  amount,
  recipientId,
  paymentDescription,
  recipientEmail,
  onSuccess,
  onError,
}: AuthorizeNetAcceptHostedProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const getHostedPaymentPageToken = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "/api/payments/authorize-net/get-hosted-page",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount,
              description: paymentDescription,
              recipientEmail,
              recipientId,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to get payment page");
        }

        const data = await response.json();
        if (data.success && data.token) {
          setToken(data.token);
        } else {
          throw new Error(data.message || "Failed to get payment token");
        }
      } catch (error: any) {
        console.error("Error getting hosted payment page token:", error);
        onError(error.message || "Failed to initialize payment form");
      } finally {
        setIsLoading(false);
      }
    };

    getHostedPaymentPageToken();
  }, [amount, paymentDescription, recipientEmail, recipientId, onError]);

  const handleTransactionResponse = (response: any) => {
    console.log("Transaction response:", response);
    if (
      response &&
      response.transactionResponse &&
      response.transactionResponse.responseCode === "1"
    ) {
      setShowOverlay(false);
      onSuccess();
    } else {
      const errorMessage =
        response && response.transactionResponse
          ? response.transactionResponse.message || "Payment failed"
          : "Payment processing failed";
      setShowOverlay(false);
      onError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Preparing secure payment form...
        </p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <p className="text-sm text-red-600">
          Unable to load the payment form. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AcceptHosted
        formToken={token}
        integration="iframe"
        onTransactionResponse={handleTransactionResponse}
        onCancel={() => {
          setShowOverlay(false);
          onError("Payment was cancelled");
        }}
        onSuccessfulSave={() => console.log("Successful save")}
      >
        <div onClick={() => setShowOverlay(true)}>
          <AcceptHosted.Button className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800">
            Pay ${amount.toFixed(2)}
          </AcceptHosted.Button>
        </div>

        {/* IFrame stays hidden unless overlay is shown */}
        {/* {showOverlay && (
          <div className="fixed inset-0 z-50 bg-white bg-opacity-95 overflow-auto p-4 h-screen w-[30vw]">
            <div className="relative w-full max-w-4xl h-full">
              <AcceptHosted.IFrame
                className="w-full h-full border-none"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  overflow: "auto",
                }}
              />
              <button
                onClick={() => setShowOverlay(false)}
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        )} */}
        {showOverlay && (
          <div className="z-50 bg-white bg-opacity-95 overflow-auto flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl">
              <div className="relative bg-white rounded-lg shadow-lg overflow-scroll max-h-[50vh]">
                <AcceptHosted.IFrame
                  className="w-full h-[62.5rem]"
                  style={{
                    border: "none",
                  }}
                />
                <button
                  onClick={() => setShowOverlay(false)}
                  className="absolute top-4 right-4 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keep backdrop hidden since we're not using modal */}
        <AcceptHosted.IFrameBackdrop className="hidden" />
      </AcceptHosted>
    </div>
  );
}
