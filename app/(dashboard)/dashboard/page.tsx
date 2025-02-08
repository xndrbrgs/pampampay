import { AddConnection } from "@/components/General/AddConnections";
import Header from "@/components/General/Header";
import LinkedCard from "@/components/General/LinkedCard";
import { addConnection } from "@/lib/actions/transfer.actions";
import { getStripeConnnectUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const user = await currentUser();
  if (!user) {
    return <div>User not found</div>;
  }

  const data = await getStripeConnnectUser(user.id);
  return (
    <section className="p-6 h-screen">
      <Header
        title="My Dashboard"
        subtext="Access and manage your account and transactions"
      />
      <div className="pt-4 max-w-3xl">
        {data?.stripeConnectedLinked === true && <LinkedCard />}
        <AddConnection onAddConnection={addConnection} />
      </div>
    </section>
  );
}
