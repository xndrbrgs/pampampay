import { AuthPaymentForm } from "@/components/Auth.Net/AuthPayForm";
import AdminComponent from "@/components/Dashboard/AdminComponent";
import Header from "@/components/General/Header";
import { GooglePayProvider } from "@/contexts/googlepay";
import {
  createOrGetUser,
  getAdminUser,
  getConnections,
} from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const user = await createOrGetUser();
  if (user.stripeConnectedLinked === false) {
    redirect("/dashboard");
  }

  const adminUser = await getAdminUser();
  const connections = await getConnections();

  if (user.id !== adminUser?.clerkUserId) {
    return (
      <GooglePayProvider>
        <section className="p-6 h-screen">
          <Header
            title="My Dashboard"
            subtext="Access and manage your account and transactions"
          />

          <div className="pt-4 max-w-3xl flex flex-col gap-y-5">
            <AuthPaymentForm connections={connections} email={userEmail} />
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
