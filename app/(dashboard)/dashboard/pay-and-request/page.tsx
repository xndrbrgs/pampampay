import Header from "@/components/General/Header";
import TransferTabs from "@/components/General/TransferTabs";

export default function TransferPage() {
  return (
    <section className="p-6 h-screen">
      <Header
        title="Transfer Money"
        subtext="Manage your transfers easily and safely."
      />
      <div className="flex flex-col gap-4 max-w-3xl">
        <TransferTabs />
      </div>
    </section>
  );
}
