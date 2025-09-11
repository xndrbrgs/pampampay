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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { BadgeDollarSign } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

type BTCPayFormProps = {
  email: string;
  connections: Array<{
    userId: string;
    email: string;
    username: string;
    profileImage: string;
    customId: string;
  }>;
};

const formSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount can have at most 2 decimal places"),
  recipientEmail: z.string().email("Invalid email address"),
  paymentDescription: z.string().min(1, "Payment description is required"),
  recipientId: z.string().min(1, "Recipient is required"),
});

export function BTCRefill({ connections }: BTCPayFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    checkoutLink: string;
    qrCodeDataUrl: string;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      recipientEmail: "",
      paymentDescription: "",
      recipientId: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/btcpay/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: values.amount,
          description: values.paymentDescription,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create BTCPay invoice");
      }

      const data = await res.json();
      setCheckoutData({
        checkoutLink: data.checkoutLink,
        qrCodeDataUrl: data.qrCodeDataUrl,
      });
    } catch (error) {
      console.error("BTCPay Error:", error);
      toast("BTCPay Error", {
        description: "Unable to initiate BTCPay checkout. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border border-gray-600 rounded-xl shadow-lg mt-3 max-w-7xl">
      <section>
        <CardHeader className="border-b border-gray-600">
          <CardTitle className="text-xl md:text-2xl flex items-center space-x-3">
            <span>BTC Refill</span>
            <BadgeDollarSign className="w-6 h-6" />
          </CardTitle>
          <CardDescription className="text-sm text-gray-400 pt-2">
            Refill the BTC balance in the server here.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-y-5"
            >
              <div className="grid grid-cols-12 gap-x-5 space-y-6 lg:space-y-0">
                <div className="col-span-12 lg:col-span-4">
                  <FormField
                    control={form.control}
                    name="paymentDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Description</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a description" />
                            </SelectTrigger>
                            <SelectContent>
                              {["BTC Refill"].map((item) => (
                                <SelectItem
                                  key={item}
                                  value={item}
                                  className="border-b border-red-500"
                                >
                                  {item}
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

                <div className="col-span-12 lg:col-span-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="input input-bordered w-full"
                            placeholder="Enter an amount"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-12 lg:col-span-4">
                  <FormField
                    control={form.control}
                    name="recipientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const selectedConnection = connections.find(
                              (connection) => connection.userId === value
                            );
                            field.onChange(value);
                            form.setValue(
                              "recipientEmail",
                              selectedConnection?.email || "RLC Server"
                            );
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a recipient" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {connections.map((connection) => (
                              <SelectItem
                                key={connection.userId}
                                value={connection.userId}
                              >
                                <div className="flex space-x-2">
                                  <img
                                    src={
                                      connection.profileImage ||
                                      "/default-profile.png"
                                    }
                                    alt={connection.username || "User"}
                                    className="h-8 w-8 rounded-full"
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-sm">
                                      {connection.username}
                                    </span>
                                    <span className="text-xs text-gray-400 truncate w-40">
                                      {connection.customId}
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="mb-5 flex items-center w-full justify-center">
                <Button type="submit" disabled={isLoading} variant="black">
                  {isLoading ? "Processing..." : "Reload BTC Amount"}
                </Button>
              </div>
            </form>
          </Form>

          {checkoutData && (
            <div className="mt-5 text-center">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => window.open(checkoutData.checkoutLink, "_blank")}
              >
                Open BTCPay Checkout
              </Button>
            </div>
          )}
        </CardContent>
      </section>
    </Card>
  );
}
