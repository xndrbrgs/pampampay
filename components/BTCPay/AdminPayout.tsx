"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BadgeDollarSign } from "lucide-react";

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  recipientEmail: z.string().email("Invalid email address"),
  recipientAddress: z.string().min(1, "Recipient BTC address is required"),
  paymentDescription: z.string().min(1, "Payment description is required"),
});

export function AdminPayout() {
  const [isLoading, setIsLoading] = useState(false);
  const [btcpayData, setBTCPayData] = useState<{
    checkoutLink: string;
    qrCodeDataUrl: string;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      recipientEmail: "",
      recipientAddress: "",
      paymentDescription: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/btcpay/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: values.amount,
          description: values.paymentDescription,
          recipientEmail: values.recipientEmail,
          recipientAddress: values.recipientAddress,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create BTCPay payout");
      }

      const data = await res.json();
      setBTCPayData({
        checkoutLink: data.checkoutLink,
        qrCodeDataUrl: data.qrCodeDataUrl,
      });
    } catch (error) {
      console.error("BTCPay payout error:", error);
      toast("Payout Failed", {
        description: "An error occurred while initiating the payout.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border border-gray-600 rounded-xl shadow-lg mt-3 max-w-3xl">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            BTC Payouts
            <BadgeDollarSign className="w-6 h-6" />
          </CardTitle>
          <CardDescription>
            Send BTC payouts directly via BTCPay Server.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-y-5"
            >
              <FormField
                control={form.control}
                name="paymentDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="What is this payment for?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Amount in USD"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="recipient@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipientAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient BTC Address</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="bc1q..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="my-4">
                {isLoading ? "Processing..." : "Send BTC Payout"}
              </Button>
            </form>
          </Form>

          {btcpayData && (
            <div className="mt-6 flex flex-col items-center gap-4">
              <img src={btcpayData.qrCodeDataUrl} alt="BTC QR Code" />
              <Button
                onClick={() =>
                  window.open(
                    btcpayData.checkoutLink,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                Open BTCPay Checkout
              </Button>
            </div>
          )}
        </CardContent>
      </motion.section>
    </Card>
  );
}
