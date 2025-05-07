"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SimplifiedAcceptHosted from "../simplified-accept-hosted";
import PaymentSuccess from "./payment-success";
import PaymentError from "./payment-error";
import { logInfo, logError } from "@/utils/payment-logger";
import { PaymentDebugPanel } from "../payment-debug-panel";

interface AuthorizeNetPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  recipientId: string;
  paymentDescription: string;
  recipientEmail: string;
  integration?: "iframe" | "redirect";
}

export function AuthorizeNetPaymentModal({
  isOpen,
  onClose,
  amount,
  recipientId,
  paymentDescription,
  recipientEmail,
  integration = "iframe", // Default to iframe integration
}: AuthorizeNetPaymentModalProps) {
  console.log("AuthorizeNetPaymentModal rendering", {
    isOpen,
    amount,
    recipientEmail,
  });
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Log when the modal is opened
  useEffect(() => {
    if (isOpen) {
      logInfo("general", "Authorize.net payment modal opened", {
        amount,
        recipientId,
        paymentDescription,
        integration,
      });
    }
  }, [isOpen, amount, recipientId, paymentDescription, integration]);

  // Reset state when modal is closed
  const handleClose = () => {
    logInfo("general", "Authorize.net payment modal closed", {
      finalStatus: paymentStatus,
    });
    setPaymentStatus("idle");
    setErrorMessage(null);
    onClose();
  };

  // Log payment status changes - memoize to prevent infinite loops
  const handlePaymentStatusChange = useCallback(
    (status: "idle" | "processing" | "success" | "error") => {
      logInfo("general", `Payment status changed to ${status}`);
      setPaymentStatus(status);
    },
    []
  );

  // Log error messages - memoize to prevent infinite loops
  const handleError = useCallback((message: string | null) => {
    if (message) {
      logError("general", "Payment error occurred", { message });
    }
    setErrorMessage(message);
  }, []);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pay with Authorize.net</DialogTitle>
          </DialogHeader>

          {paymentStatus === "success" ? (
            <PaymentSuccess amount={amount} onClose={handleClose} />
          ) : paymentStatus === "error" ? (
            <PaymentError
              errorMessage={errorMessage}
              onRetry={() => handlePaymentStatusChange("idle")}
            />
          ) : (
            <SimplifiedAcceptHosted
              amount={amount}
              recipientId={recipientId}
              recipientEmail={recipientEmail}
              paymentDescription={paymentDescription}
              onPaymentStatusChange={handlePaymentStatusChange}
              onError={handleError}
            />
          )}
        </DialogContent>
      </Dialog>
      <PaymentDebugPanel />
    </>
  );
}
