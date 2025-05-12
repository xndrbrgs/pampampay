import { AuthPaymentForm } from "@/components/Auth.Net/AuthPayForm";
import PaymentWrapperAuth from "@/components/Auth.Net/using-auth/PaymentWrapperAuth";
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
  // const connections = await getConnections();

  if (user.id !== adminUser?.clerkUserId) {
    return (
      <GooglePayProvider>
        <section className="p-6 h-screen">
          <Header
            title="My Dashboard"
            subtext="Access and manage your account and transactions"
          />

          <div className="pt-4 max-w-3xl flex flex-col gap-y-5">
            <PaymentWrapperAuth />
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
