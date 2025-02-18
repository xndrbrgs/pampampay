import { AddConnection } from "@/components/General/AddConnections";
import Header from "@/components/General/Header";
import TransferTabs from "@/components/General/TransferTabs";
import { addConnection } from "@/lib/actions/transfer.actions";
import { createOrGetUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

export default async function TransferPage() {
   const user = await createOrGetUser();
    if (user.stripeConnectedLinked === false) {
      redirect("/dashboard");
    }
  
  return (
    <section className="p-6 h-screen">
      <Header
        title="Transfer Money"
        subtext="Manage your transfers easily and safely."
      />
      <div className="flex flex-col gap-4 max-w-3xl">
        <AddConnection onAddConnection={addConnection} />
        <TransferTabs />
      </div>
    </section>
  );
}
