"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthorizeNetHostedForm } from "./authorize-net-hosted-form";
import { GooglePayButton } from "../wallets/AuthGoogle";
import { useGooglePay } from "@/contexts/googlepay";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  recipientId: string;
  paymentDescription: string;
  recipientEmail: string;
};

export function PaymentModalSimplified({
  isOpen,
  onClose,
  amount,
  recipientId,
  paymentDescription,
  recipientEmail,
}: PaymentModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("card");

  // Use the Google Pay context
  const { isAvailable: googlePayAvailable } = useGooglePay();

  const handleSuccess = () => {
    const successAnimation = document.createElement("div");
    successAnimation.className =
      "fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-[10000]";
    successAnimation.innerHTML = `
        <div class="p-6 bg-white rounded-lg shadow-lg text-center">
            <h2 class="text-2xl font-bold text-black" style="opacity: 0; animation: fadeIn 0.5s forwards 0.2s;">
                Payment Successful!
            </h2>
            <p class="mt-2 text-gray-600" style="opacity: 0; animation: fadeIn 0.5s forwards 0.5s;">
                Thank you for your payment.
            </p>
        </div>
        <style>
            @keyframes fadeIn {
                to {
                    opacity: 1;
                }
            }
        </style>
    `;

    document.body.appendChild(successAnimation);

    setTimeout(() => {
      document.body.removeChild(successAnimation);
    }, 3000);
    setError(null);
    onClose();
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] z-[9000]">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="py-2">
          <div className="mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm md:text-xl text-muted-foreground">
                Amount:
              </span>
              <span className="font-medium md:text-xl">
                ${amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm md:text-xl text-muted-foreground">
                Recipient:
              </span>
              <span className="font-medium md:text-xl">PamPamPay</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm md:text-xl text-muted-foreground">
                Description:
              </span>
              <span className="font-medium md:text-xl">
                {paymentDescription}
              </span>
            </div>
          </div>

          <Tabs
            defaultValue="card"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList
              className="grid w-full"
              style={{
                gridTemplateColumns: `repeat(${
                  1 + (googlePayAvailable ? 1 : 0)
                }, 1fr)`,
              }}
            >
              <TabsTrigger value="card">Credit Card</TabsTrigger>
              {googlePayAvailable && (
                <TabsTrigger value="google-pay">Google Pay</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="card" className="mt-4">
              <AuthorizeNetHostedForm
                amount={amount}
                recipientId={recipientId}
                paymentDescription={paymentDescription}
                recipientEmail={recipientEmail}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </TabsContent>

            {googlePayAvailable && (
              <TabsContent value="google-pay" className="mt-4">
                <GooglePayButton
                  amount={amount}
                  recipientId={recipientId}
                  paymentDescription={paymentDescription}
                  recipientEmail={recipientEmail}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
