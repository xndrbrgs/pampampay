import AdminComponent from "@/components/Dashboard/AdminComponent";
import Header from "@/components/General/Header";
import { StrangerGames } from "@/components/General/StrangerGames";
import TransferTabs from "@/components/General/TransferTabs";
import { addConnection } from "@/lib/actions/transfer.actions";
import {
  getAdminUser,
  hasConnectionWithUser,
} from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const user = await currentUser();
  if (!user) {
    return <div>User not found</div>;
  }

  const adminUser = await getAdminUser();

  if (user.id !== adminUser?.clerkUserId) {
    return (
      <section className="p-6 h-full">
        <Header
          title="My Dashboard"
          subtext="Access and manage your account and transactions"
        />

        <div className="pt-4 max-w-3xl flex flex-col gap-y-5">
          <StrangerGames onAddConnection={addConnection} />
          <TransferTabs />
        </div>
      </section>
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
