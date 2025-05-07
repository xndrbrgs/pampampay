"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthorizeNetPaymentModal } from "./authorize-net-payment-modal";
import { logInfo } from "@/utils/payment-logger";

interface AuthorizePaymentButtonProps {
  amount: number;
  recipientId: string;
  recipientEmail: string;
  paymentDescription: string;
  buttonText?: string;
  className?: string;
  integration?: "iframe" | "redirect";
}

export function AuthorizePaymentButton({
  amount,
  recipientId,
  recipientEmail,
  paymentDescription,
  buttonText = "Pay Now",
  className = "",
  integration = "iframe", // Default to iframe integration
}: AuthorizePaymentButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    logInfo("general", "Payment button clicked", {
      amount,
      recipientId,
      paymentDescription,
      integration,
    });
    setIsModalOpen(true);
  };

  return (
    <>
      <Button onClick={handleOpenModal} className={className}>
        {buttonText}
      </Button>

      <AuthorizeNetPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amount={amount}
        recipientId={recipientId}
        recipientEmail={recipientEmail}
        paymentDescription={paymentDescription}
        integration={integration}
      />
    </>
  );
}
