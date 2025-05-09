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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  CircleDollarSign,
  CreditCard,
  Wallet,
  CreditCardIcon,
} from "lucide-react";
import { toast } from "sonner";
import { PayPalButtonsWrapper } from "../Paypal/paypal-buttons";
import { AuthorizeNetPaymentModal } from "../Auth.Net/react-acceptjs/authorize-net-payment-modal";
import { createStripeSession } from "@/lib/actions/transfer.actions";
import ReactAuthNetForm from "./react-auth-net/ReactAuthForm";
import ChatForm from "./chat-net/ChatForm";
import AcceptFormHosted from "./chat-net/AcceptFormHosted";

type UnifiedPaymentFormProps = {
  connections: Array<{
    userId: string;
    email: string;
    username: string;
    profileImage: string;
    customId: string;
  }>;
};

// Choose ONE of the following selector types:
// Options: "select", "tabs", "buttons", "cards"
const SELECTOR_TYPE = "buttons";

const formSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount can have at most 2 decimal places"),
  recipientEmail: z.string().email("Invalid email address"),
  paymentDescription: z.string().min(1, "Payment description is required"),
  recipientId: z.string().min(1, "Recipient is required"),
  paymentMethod: z.enum(["stripe", "paypal", "coinbase", "authorize"], {
    required_error: "Please select a payment method",
  }),
});

export function AuthPaymentForm({ connections }: UnifiedPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);
  const [showAuthorizeNet, setShowAuthorizeNet] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "stripe" | "paypal" | "coinbase" | "authorize"
  >("authorize");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      recipientEmail: "",
      paymentDescription: "",
      recipientId: "",
      paymentMethod: "stripe",
    },
  });

  // Update the form value when payment method changes
  const handlePaymentMethodChange = (
    value: "stripe" | "paypal" | "coinbase" | "authorize"
  ) => {
    setPaymentMethod(value);
    form.setValue("paymentMethod", value);
  };

  // Add createCoinbaseCharge function
  const createCoinbaseCharge = async (data: {
    amount: number;
    paymentDescription: string;
    recipientEmail: string;
    recipientId: string;
  }) => {
    const response = await fetch("/api/payments/coinbase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create Coinbase charge");
    }
    const result = await response.json();
    // Redirect to Coinbase hosted checkout page
    window.location.href = result.data.hosted_url;
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Ensure the payment method is set correctly
    values.paymentMethod = paymentMethod;

    setIsLoading(true);
    try {
      if (values.paymentMethod === "stripe") {
        await createStripeSession({
          amount: values.amount,
          paymentDescription: values.paymentDescription,
          recipientEmail: values.recipientEmail,
          recipientId: values.recipientId,
          ssn: "", // Optional SSN field
        });
      } else if (values.paymentMethod === "paypal") {
        setShowPayPal(true);
      } else if (values.paymentMethod === "coinbase") {
        await createCoinbaseCharge({
          amount: values.amount,
          paymentDescription: values.paymentDescription,
          recipientEmail: values.recipientEmail,
          recipientId: values.recipientId,
        });
      } else if (values.paymentMethod === "authorize") {
        setShowAuthorizeNet(true);
      }
    } catch (error) {
      console.error("Error initiating transfer:", error);
      toast("Transfer Initiation Failed", {
        description:
          "An error occurred while initiating the transfer. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleAuthorizeNetSuccess = () => {
    toast("Payment Successful", {
      description: "Your payment has been processed successfully.",
    });
    setShowAuthorizeNet(false);
  };

  // Render the appropriate payment method selector based on the chosen type
  const renderPaymentMethodSelector = () => {
    switch (SELECTOR_TYPE) {
      case "buttons":
        return (
          <div className="my-6">
            <FormLabel className="mb-4">Choose Payment Method</FormLabel>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mt-2 w-full">
              {/* <Button
                type="button"
                variant={paymentMethod === "stripe" ? "chosen" : "unchosen"}
                className="flex-1"
                onClick={() => handlePaymentMethodChange("stripe")}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Amazon Pay, Cash App
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "paypal" ? "chosen" : "unchosen"}
                className="flex-1"
                onClick={() => handlePaymentMethodChange("paypal")}
              >
                <Wallet className="w-4 h-4 mr-2" />
                PayPal, Venmo
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "coinbase" ? "chosen" : "unchosen"}
                className="flex-1"
                onClick={() => handlePaymentMethodChange("coinbase")}
              >
                <CircleDollarSign className="w-4 h-4 mr-2" />
                Coinbase
              </Button> */}
              <Button
                type="button"
                variant={paymentMethod === "authorize" ? "chosen" : "unchosen"}
                className="flex-1"
                onClick={() => handlePaymentMethodChange("authorize")}
              >
                <CreditCardIcon className="w-4 h-4 mr-2" />
                Authorize.net
              </Button>
            </div>
            <FormDescription className="mt-2">
              Select how you would like to make your payment
            </FormDescription>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="border bg-background border-gray-600 rounded-xl shadow-lg mt-3 max-w-7xl">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <CardHeader className="border-b border-gray-600">
          <CardTitle className="text-2xl md:text-3xl flex items-center space-x-3">
            <BadgeDollarSign size={30} />
            <span>Perform Transfer</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-y-5"
            >
              {/* Payment Method Selector */}
              {renderPaymentMethodSelector()}

              <div className="grid grid-cols-12 space-y-6 lg:space-y-0">
                <div className="col-span-12 lg:col-span-6">
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
                              <SelectItem
                                value="RS"
                                className="border-b border-purple/80"
                              >
                                RS
                              </SelectItem>
                              <SelectItem
                                value="OS"
                                className="border-b border-purple/80"
                              >
                                OS
                              </SelectItem>
                              <SelectItem
                                value="JW"
                                className="border-b border-purple/80"
                              >
                                JW
                              </SelectItem>
                              <SelectItem
                                value="GV"
                                className="border-b border-purple/80"
                              >
                                GV
                              </SelectItem>
                              <SelectItem
                                value="BD"
                                className="border-b border-purple/80"
                              >
                                BD
                              </SelectItem>
                              <SelectItem
                                value="VX"
                                className="border-b border-purple/80"
                              >
                                VX
                              </SelectItem>
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
                </div>

                <div className="col-span-12 lg:col-span-6">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            defaultValue={field.value.toString()}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select an amount" />
                            </SelectTrigger>
                            <SelectContent>
                              {[0.5, 1].map((value) => (
                                <SelectItem
                                  key={value}
                                  value={value.toString()}
                                  className="py-2 border-b border-purple/80"
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
                </div>

                <div className="grid-cols-12 mt-3">
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
                                <div className="flex space-x-2 scale-100 md:scale-90 lg:scale-100">
                                  <img
                                    src={
                                      connection.profileImage ||
                                      "/default-profile.png" ||
                                      "/placeholder.svg" ||
                                      "/placeholder.svg" ||
                                      "/placeholder.svg"
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
                        <FormDescription>
                          Select the recipient for your transfer.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="mb-5 flex items-center w-full justify-center">
                <Button type="submit" disabled={isLoading} variant="black">
                  {isLoading ? "Initiating Transfer..." : "Initiate Transfer"}
                </Button>
              </div>
            </form>
          </Form>

          {showPayPal && (
            <motion.div
              className="mt-5 w-full"
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
                variant="chosen"
                className="w-full my-4"
                onClick={() => setShowPayPal(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </motion.div>
          )}

          {/* Authorize.Net Payment Modal */}
          {/* <AuthorizeNetPaymentModal
            isOpen={showAuthorizeNet}
            onClose={() => setShowAuthorizeNet(false)}
            amount={form.getValues().amount}
            recipientId={form.getValues().recipientId}
            recipientEmail={form.getValues().recipientEmail}
            paymentDescription={form.getValues().paymentDescription}
          /> */}
          {/* <ReactAuthNetForm amount={form.getValues().amount} /> */}
          <AcceptFormHosted />
        </CardContent>
      </motion.section>
    </Card>
  );
}
