import ConnectedDataTable from "@/components/Dashboard/DataTable/connected-table";
import Header from "@/components/General/Header";
import { getUserStripeTransactions } from "@/lib/actions/transfer.actions";
import { createOrGetUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

const TransactionsPage = async () => {
  const user = await createOrGetUser();
  if (user.stripeConnectedLinked === false) {
    redirect("/dashboard");
  }

  const transfers = await getUserStripeTransactions();
  console.log(transfers);

  return (
    <section className="p-6 h-screen gap-y-4">
      <Header
        title="Recent Transactions"
        subtext="View your transactions here."
      />
      <div>
        <ConnectedDataTable transfers={transfers} />
      </div>
    </section>
  );
};

export default TransactionsPage;
