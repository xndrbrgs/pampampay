"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bitcoin, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BTCPayPaymentForm() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutLink, setCheckoutLink] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setCheckoutLink(null);

    try {
      const res = await fetch("/api/btcpay/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount.toString(), description }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Failed to create payment");
      }

      const data = await res.json();
      setCheckoutLink(data.checkoutLink);

      toast({
        title: "Payment request created",
        description: "Redirecting to BTCPay checkout...",
      });

      window.location.href = data.checkoutLink;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not create payment. Try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setCheckoutLink(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bitcoin className="h-6 w-6 text-orange-500" />
          {checkoutLink ? "BTCPay Payment" : "Create BTCPay Payment"}
        </CardTitle>
        <CardDescription>
          Generate a Bitcoin payment via your BTCPay Server
        </CardDescription>
      </CardHeader>

      {!checkoutLink ? (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="What is this payment for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Payment...
                </>
              ) : (
                "Create Payment"
              )}
            </Button>
          </CardFooter>
        </form>
      ) : (
        <CardContent className="space-y-4 text-center">
          <Badge variant="secondary" className="flex items-center gap-1 justify-center">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Waiting for payment
          </Badge>
          <p className="text-gray-600 text-sm">
            If not redirected, <a href={checkoutLink} className="underline text-blue-600" target="_blank" rel="noopener noreferrer">click here to open the payment page</a>.
          </p>
        </CardContent>
      )}

      {checkoutLink && (
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={resetForm} className="flex-1 bg-transparent">
            Create New Payment
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
