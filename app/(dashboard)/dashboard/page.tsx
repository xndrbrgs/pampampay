import { AddConnection } from "@/components/General/AddConnections";
import Header from "@/components/General/Header";
import { addConnection } from "@/lib/actions/transfer.actions";

export default function Dashboard() {
  return (
    <section className="p-6 h-screen">
      <Header
        title="My Dashboard"
        subtext="Access and manage your account and transactions"
      />
      <div className="pt-4 max-w-3xl">
        <AddConnection onAddConnection={addConnection} />
      </div>
    </section>
  );
}
