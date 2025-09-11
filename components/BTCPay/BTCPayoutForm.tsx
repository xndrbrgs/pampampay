"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import BitcoinAnimation from "./Payouts/BitcoinAnim";

const formSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount can have at most 2 decimal places"),
  recipientEmail: z.string().email("Invalid email address"),
  personName: z.string().min(1, "Recipient name is required"),
  recipientAddress: z.string().min(1, "Recipient BTC address is required"),
  paymentDescription: z.string().min(1, "Payment description is required"),
});

export function BTCPayoutForm({ email }: { email?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      recipientEmail: email,
      recipientAddress: "",
      paymentDescription: "",
      personName: "",
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
          recipientEmail: email,
          recipientAddress: values.recipientAddress,
          personName: values.personName,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create BTCPay payout");
      }

      await res.json();
      setIsSuccess(true);
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
    <Card className="border bg-white/10 border-gray-600 rounded-xl shadow-lg mt-3 max-w-7xl">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <CardHeader className="border-b border-gray-600">
          <CardTitle className="text-2xl md:text-3xl flex items-center space-x-3">
            Request BTC Payout
            <BadgeDollarSign className="w-6 h-6" />
          </CardTitle>
          <CardDescription className="text-sm text-gray-400">
            Receive BTC payouts directly to your BTC address!
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isSuccess ? (
            <BitcoinAnimation />
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-y-5"
              >
                <div className="grid grid-cols-12 gap-x-5 space-y-6 lg:space-y-0">
                  <div className="col-span-12 lg:col-span-6">
                    <FormField
                      control={form.control}
                      name="personName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What's your name on Facebook?</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Please write exact Facebook name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-12 lg:col-span-6">
                    <FormField
                      control={form.control}
                      name="paymentDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Which game did you play?</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Please write game name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-12 lg:col-span-6">
                    <FormField
                      control={form.control}
                      name="recipientAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>BTC Address</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="bc1q..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-12 lg:col-span-6">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Max cashout per day:
                            <span className="text-green-500">$300</span>
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(Number(value))
                              }
                              defaultValue={field.value.toString()}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select amount" />
                              </SelectTrigger>
                              <SelectContent>
                                {[
                                  20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 200,
                                  300,
                                ].map((value) => (
                                  <SelectItem
                                    key={value}
                                    value={value.toString()}
                                    className="py-2 border-b border-red-500"
                                  >
                                    ${value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="chosen"
                  disabled={isLoading}
                  className="my-4"
                >
                  {isLoading ? "Processing..." : "Request BTC Payout"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </motion.section>
    </Card>
  );
}
