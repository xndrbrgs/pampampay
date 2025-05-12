import { AuthPaymentForm } from "@/components/Auth.Net/AuthPayForm";
import AcceptPaymentForm from "@/components/Auth.Net/using-auth/AuthProcessForm";
import PaymentStatus from "@/components/Auth.Net/using-auth/PaymentStatus";
import AdminComponent from "@/components/Dashboard/AdminComponent";
import Header from "@/components/General/Header";
import { PayPalProvider } from "@/components/Paypal/PaypalProvider";
import { GooglePayProvider } from "@/contexts/googlepay";
import { getAdminUser, getConnections } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { useState } from "react";

export default async function Dashboard() {
  const user = await currentUser();
  if (!user) {
    return <div>User not found</div>;
  }

  const adminUser = await getAdminUser();
  const connections = await getConnections();

  const [paymentStatus, setPaymentStatus] = useState<{
    success: boolean;
    transactionId?: string;
    error?: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSubmit = async (
    dataDescriptor: string,
    dataValue: string,
    amount: string
  ) => {
    setIsProcessing(true);

    try {
      console.log("Submitting payment with:", {
        dataDescriptor,
        dataValue,
        amount,
      });

      const response = await fetch("/api/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataDescriptor,
          dataValue,
          amount,
        }),
      });

      const result = await response.json();
      console.log("Payment result:", result);

      if (response.ok) {
        setPaymentStatus({
          success: true,
          transactionId: result.transactionId,
        });
      } else {
        setPaymentStatus({
          success: false,
          error: result.error || "Payment processing failed",
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus({
        success: false,
        error: "An unexpected error occurred",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetPayment = () => {
    setPaymentStatus(null);
  };

  if (user.id !== adminUser?.clerkUserId) {
    return (
      <GooglePayProvider>
        <section className="p-6 h-screen">
          <Header
            title="My Dashboard"
            subtext="Access and manage your account and transactions"
          />

          <div className="pt-4 max-w-3xl flex flex-col gap-y-5">
            {paymentStatus ? (
              <PaymentStatus
                success={paymentStatus.success}
                transactionId={paymentStatus.transactionId}
                error={paymentStatus.error}
                onReset={resetPayment}
              />
            ) : (
              <AcceptPaymentForm
                onSubmit={handlePaymentSubmit}
                isProcessing={isProcessing}
              />
            )}
          </div>
        </section>
      </GooglePayProvider>
    );
  } else {
    return (
      <section className="p-6 h-screen">
        <Header
          title="Admin Dashboard"
          subtext="Manage users and system settings"
        />

        <div className="pt-4 max-w-3xl flex flex-col gap-y-5">
          <AdminComponent />
        </div>
      </section>
    );
  }
}
