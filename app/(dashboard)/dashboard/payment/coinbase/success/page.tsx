"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Home, Loader2 } from "lucide-react";

export default function CoinbaseSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Check for Coinbase parameters
    const chargeId = searchParams.get("charge_id");

    if (chargeId) {
      // Handle Coinbase success
      const fetchCoinbasePaymentDetails = async () => {
        try {
          const response = await fetch(`/api/payments/coinbase/${chargeId}`);
          const data = await response.json();

          if (response.ok) {
            setPaymentDetails({
              id: data.charge.id,
              amount: data.charge.pricing.local.amount,
              currency: data.charge.pricing.local.currency,
              status:
                data.charge.timeline[data.charge.timeline.length - 1].status,
              createdAt: data.charge.created_at,
              paymentMethod: "Coinbase (Crypto)",
            });
          }
        } catch (error) {
          console.error("Error fetching Coinbase payment details:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCoinbasePaymentDetails();
    } else {
      // No charge_id parameter, show generic success
      setTimeout(() => {
        setPaymentDetails({
          id: "payment_" + Math.random().toString(36).substring(2, 15),
          amount: "50.00",
          currency: "USD",
          status: "completed",
          createdAt: new Date().toISOString(),
          paymentMethod: "Crypto",
        });
        setIsLoading(false);
      }, 1000);
    }
  }, [searchParams]);

  return (
    <div className="container max-w-md py-10">
      <Card className="bg-transparent border border-white/20 shadow-md text-white">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your crypto payment has been processed successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paymentDetails ? (
            <div className="rounded-lg border border-white/20 p-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-400">Amount:</div>
                <div className="font-medium text-right">
                  {paymentDetails.amount} {paymentDetails.currency}
                </div>
                <div className="text-gray-400">Status:</div>
                <div className="font-medium text-right capitalize">
                  {paymentDetails.status.toLowerCase()}
                </div>
                <div className="text-gray-400">Method:</div>
                <div className="font-medium text-right">
                  {paymentDetails.paymentMethod}
                </div>
                <div className="text-gray-400">Date:</div>
                <div className="font-medium text-right">
                  {new Date(paymentDetails.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-400">
              No payment details found
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push("/dashboard")}>
            <Home className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
