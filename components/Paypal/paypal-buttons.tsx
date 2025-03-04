"use client";

import { useToast } from "@/hooks/use-toast";
import { PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalButtonsProps {
  amount: number;
  recipientId: string;
  paymentDescription?: string;
}

export function PayPalButtonsWrapper({
  amount,
  recipientId,
  paymentDescription,
}: PayPalButtonsProps) {
  const { toast } = useToast();

  const createTransfer = async () => {
    try {
      const response = await fetch("/api/paypal/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          recipientId,
          paymentDescription,
        }),
      });

      console.log("Response from transfer creation:", response);

      const transferData = await response.json();

      if (transferData.id) {
        return transferData.id;
      } else {
        throw new Error(JSON.stringify(transferData));
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not initiate transfer. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const onApprove = async (data: { orderID: string }) => {
    try {
      const response = await fetch(
        `/api/paypal/transfers/${data.orderID}/capture`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const transferData = await response.json();
      console.log(transferData);

      const transaction =
        transferData?.purchase_units?.[0]?.payments?.captures?.[0];

      if (transaction?.status === "COMPLETED") {
        toast({
          title: "Transfer Successful",
          description: `Transaction ${transaction.status}: ${transaction.id}`,
        });

      } else {
        throw new Error(JSON.stringify(transferData));
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Transfer Failed",
        description: "Your transfer could not be processed. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <PayPalButtons
      createOrder={createTransfer}
      onApprove={onApprove}
      style={{
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
      }}
    />
  );
}
