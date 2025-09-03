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
import {
  BadgeDollarSign,
  Construction,
  CreditCardIcon,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PayPalButtonsWrapper } from "../Paypal/paypal-buttons";
import { SquarePaymentModal } from "@/components/Square/square-payment-modal";
import { createStripeSession } from "@/lib/actions/stripe.actions";
import PaymentWrapperAuth from "../Auth.Net/using-auth/PaymentWrapperAuth";

type UnifiedPaymentFormProps = {
  email: string;
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
  paymentMethod: z.enum(
    ["authorize", "btcpay", "stripe", "paypal", "coinbase", "square"],
    {
      required_error: "Please select a payment method",
    }
  ),
});

export function TestingForm({ connections, email }: UnifiedPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);
  const [showSquare, setShowSquare] = useState(false);
  const [showAuthorizeNet, setShowAuthorizeNet] = useState(false);
  const [showBTCPay, setShowBTCPay] = useState(false);
  const [btcpayData, setBTCPayData] = useState<{
    checkoutLink: string;
    qrCodeDataUrl: string;
  } | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<
    "authorize" | "btcpay" | "stripe" | "paypal" | "coinbase" | "square"
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
    value: "authorize" | "btcpay" | "stripe" | "paypal" | "coinbase" | "square"
  ) => {
    setPaymentMethod(value);
    form.setValue("paymentMethod", value);
  };

  // Coinbase charge function
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
      } else if (values.paymentMethod === "authorize") {
        setShowAuthorizeNet(true);
      } else if (values.paymentMethod === "paypal") {
        setShowPayPal(true);
      } else if (values.paymentMethod === "coinbase") {
        await createCoinbaseCharge({
          amount: values.amount,
          paymentDescription: values.paymentDescription,
          recipientEmail: values.recipientEmail,
          recipientId: values.recipientId,
        });
      } else if (values.paymentMethod === "square") {
        setShowSquare(true);
      } else if (values.paymentMethod === "btcpay") {
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
        // Only keep checkoutLink and qrCodeDataUrl (no lnInvoice)
        setBTCPayData({
          checkoutLink: data.checkoutLink,
          qrCodeDataUrl: data.qrCodeDataUrl,
        });
        setShowBTCPay(true);
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

  const renderPaymentMethodSelector = () => {
    switch (SELECTOR_TYPE) {
      case "buttons":
        return (
          <div className="my-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 space-y-3 lg:space-y-0 space-x-0 lg:space-x-5 mt-2 w-full">
              <Button
                type="button"
                variant={paymentMethod === "authorize" ? "chosen" : "unchosen"}
                className="flex-1"
                onClick={() => handlePaymentMethodChange("authorize")}
              >
                <CreditCardIcon className="w-4 h-4 mr-2" />
                Card
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "btcpay" ? "chosen" : "unchosen"}
                className="flex-1 mt-3 lg:mt-0 items-center"
                onClick={() => handlePaymentMethodChange("btcpay")}
              >
                <img
                  src="/svg/cashapp.svg"
                  alt="Cashapp logo"
                  className="h-4 w-4 mr-2 inline-block"
                />
                CashApp
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "paypal" ? "chosen" : "unchosen"}
                className="flex-1 mt-3 lg:mt-0 items-center"
                onClick={() => handlePaymentMethodChange("paypal")}
              >
                <BadgeDollarSign className="w-4 h-4" />
                Paypal
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "coinbase" ? "chosen" : "unchosen"}
                className="flex-1 mt-3 lg:mt-0 items-center"
                onClick={() => handlePaymentMethodChange("coinbase")}
              >
                <BadgeDollarSign className="w-4 h-4" />
                Coinbase
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
    <Card className="border border-gray-600 rounded-xl shadow-lg mt-3 max-w-7xl">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <CardHeader className="border-b border-gray-600">
          <CardTitle className="text-2xl md:text-3xl flex items-center space-x-3">
            <BadgeDollarSign className="w-7 h-7" />
            <span>Perform Transfer</span>
          </CardTitle>
          <CardDescription className="text-sm text-gray-400">
            Select a payment method to initiate a transfer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-y-5"
            >
              {renderPaymentMethodSelector()}

              <div className="grid grid-cols-12 gap-x-5 space-y-6 lg:space-y-0">
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
                                value="GV"
                                className="border-b border-red-500"
                              >
                                GV
                              </SelectItem>
                              <SelectItem
                                value="PR"
                                className="border-b border-red-500"
                              >
                                PR
                              </SelectItem>
                              <SelectItem
                                value="JW"
                                className="border-b border-red-500"
                              >
                                JW
                              </SelectItem>
                              <SelectItem
                                value="VB"
                                className="border-b border-red-500"
                              >
                                VB
                              </SelectItem>
                              <SelectItem
                                value="BD"
                                className="border-b border-red-500"
                              >
                                BD
                              </SelectItem>
                              <SelectItem
                                value="FK"
                                className="border-b border-red-500"
                              >
                                FK
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
                              {[5].map((value) => (
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
                        <FormDescription>
                          Select the amount you want to transfer.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-12 mt-3">
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

              {!showPayPal && (
                <div className="mb-5 flex items-center w-full justify-center">
                  <Button type="submit" disabled={isLoading} variant="black">
                    {isLoading ? "Initiating Transfer..." : "Initiate Transfer"}
                  </Button>
                </div>
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
                variant="chosen"
                className="w-full my-4"
                onClick={() => setShowPayPal(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </motion.div>
          )}

          {showBTCPay && btcpayData && (
            <div className="grid grid-cols-12">
              <button
                onClick={() => {
                  const newWindow = window.open(
                    btcpayData.checkoutLink,
                    "_blank",
                    "noopener,noreferrer"
                  );

                  if (
                    !newWindow ||
                    newWindow.closed ||
                    typeof newWindow.closed === "undefined"
                  ) {
                    return; // Handle the case where the popup was blocked
                  }

                  setShowBTCPay(false);
                }}
                className="block text-black rounded-xl text-md bg-red-500 border hover:text-white hover:border-white/20 cursor-pointer shadow-sm md:col-start-5 md:col-end-9 col-span-12 mb-6 py-2 font-semibold transition duration-150"
              >
                Continue to Checkout
              </button>
            </div>
          )}

          {/* {showBTCPay &&
            btcpayData &&
            (() => {
              // Open the BTCPay checkout link in a new window automatically
              if (typeof window !== "undefined" && btcpayData.checkoutLink) {
                window.open(
                  btcpayData.checkoutLink,
                  "_blank",
                  "noopener,noreferrer"
                );
              }
              // Reset showBTCPay so it doesn't keep opening
              setShowBTCPay(false);
              return null;
            })()} */}

          {showAuthorizeNet && (
            <motion.div
              className="mt-5 w-full flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <PaymentWrapperAuth
                amount={form.getValues().amount}
                recipientId={form.getValues().recipientId}
                paymentDescription={form.getValues().paymentDescription}
                email={email}
              />

              <Button
                variant="chosen"
                className="w-full my-4"
                onClick={() => setShowAuthorizeNet(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </motion.div>
          )}

          <SquarePaymentModal
            isOpen={showSquare}
            onClose={() => setShowSquare(false)}
            amount={form.getValues().amount}
            recipientId={form.getValues().recipientId}
            paymentDescription={form.getValues().paymentDescription}
            recipientEmail={form.getValues().recipientEmail}
          />
        </CardContent>
      </motion.section>
    </Card>
  );
}
