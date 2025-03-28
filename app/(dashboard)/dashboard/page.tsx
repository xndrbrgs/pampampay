import AdminComponent from "@/components/Dashboard/AdminComponent";
import Header from "@/components/General/Header";
import TransferTabs from "@/components/General/TransferTabs";
import { PayPalProvider } from "@/components/Paypal/PaypalProvider";
import { getAdminUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const user = await currentUser();
  if (!user) {
    return <div>User not found</div>;
  }

  const adminUser = await getAdminUser();

  if (user.id !== adminUser?.clerkUserId) {
    return (
      <PayPalProvider>
        <section className="p-6 h-full">
          <Header
            title="My Dashboard"
            subtext="Access and manage your account and transactions"
          />

          <div className="pt-4 max-w-3xl flex flex-col gap-y-5">
            <TransferTabs />
          </div>
        </section>
      </PayPalProvider>
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
