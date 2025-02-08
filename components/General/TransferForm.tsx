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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createStripeSession } from "@/lib/actions/transfer.actions";

type TransferFormProps = {
  connections: Array<{ userId: string; email: string }>;
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

export function TransferForm({ connections }: TransferFormProps) {
  const [isLoading, setIsLoading] = useState(false);

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
      const stripeSession = await createStripeSession({
        amount: values.amount,
        paymentDescription: values.paymentDescription,
        recipientEmail: values.recipientEmail,
        recipientId: values.recipientId,
      });
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
    <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
      <CardHeader>
        <CardTitle>Initiate Transfer</CardTitle>
        <CardDescription>Transfer money to a connection.</CardDescription>
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
                    <Input placeholder="Consultation Fees" {...field} />
                  </FormControl>
                  <FormDescription>Write a small description.</FormDescription>
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
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        // Ensure the value is greater than zero
                        if (value > 0) {
                          field.onChange(value);
                        } else {
                          // Optionally, you can set a minimum value or reset to a default
                          field.onChange(0.01); // Set to a small positive number
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the amount you want to transfer.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipientId" // Store the connection ID
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const selectedConnection = connections.find(
                        (connection) => connection.userId === value
                      );
                      field.onChange(value); // Set the ID
                      form.setValue(
                        "recipientEmail",
                        selectedConnection?.email || ""
                      ); // Set the email
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
                          value={connection.userId} // Use connection.id as the value
                        >
                          {connection.email}
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

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Initiating Transfer..." : "Initiate Transfer"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
