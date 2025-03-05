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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { PayPalButtonsWrapper } from "./paypal-buttons";

type TransferFormProps = {
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

export function PaypalForm({ connections }: TransferFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);

  const { toast } = useToast();

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
      setShowPayPal(true);
    } catch (error) {
      console.error("Error initiating transfer:", error);
      toast({
        title: "Transfer Initiation Failed",
        description:
          "An error occurred while initiating the transfer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="bg-transparent border border-white/20 shadow-md mt-3">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <CardHeader>
          <CardTitle>Perform Transfer</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="paymentDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What is this payment for?</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a description" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GV">GV</SelectItem>
                          <SelectItem value="PR">PR</SelectItem>
                          <SelectItem value="JW">JW</SelectItem>
                          <SelectItem value="OS">OS</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Select a description for the payment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={field.value.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an amount" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100,
                          ].map((value) => (
                            <SelectItem
                              key={value}
                              value={value.toString()}
                              className="py-1"
                            >
                              ${value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Select the amount you want to transfer.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          selectedConnection?.email || ""
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
                            <div className="flex space-x-2 p-2 scale-100 md:scale-90 lg:scale-100">
                              <img
                                src={
                                  connection.profileImage ||
                                  "/default-profile.png" ||
                                  "/placeholder.svg"
                                }
                                alt={connection.username || "User"}
                                className="h-8 w-8 rounded-full"
                              />
                              <div className="flex flex-col">
                                <span className="text-sm">
                                  {connection.username}
                                </span>
                                <span className="text-xs text-gray-400 truncate">
                                  {connection.customId}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the recipient for your transfer.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!showPayPal && (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Initiating Transfer..." : "Initiate Transfer"}
                </Button>
              )}
            </form>
          </Form>
          {showPayPal && (
            <motion.div
              className="mt-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <PayPalButtonsWrapper
                amount={form.getValues().amount}
                recipientId={form.getValues().recipientId}
                paymentDescription={form.getValues().paymentDescription}
              />
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setShowPayPal(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </motion.div>
          )}
        </CardContent>
      </motion.section>
    </Card>
  );
}
