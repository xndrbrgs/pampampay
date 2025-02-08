import TransactionsTable from "@/components/Dashboard/TransactionsTable";
import Header from "@/components/General/Header";
import { getUserTransactions } from "@/lib/actions/transfer.actions";

const TransactionsPage = async () => {
  const { sentTransfers, receivedTransfers } = await getUserTransactions();

  return (
    <section className="p-6 h-screen gap-y-4">
      <Header
        title="Recent Transactions"
        subtext="View your transactions here."
      />
      <TransactionsTable
        sentTransfers={sentTransfers}
        receivedTransfers={receivedTransfers}
      />
    </section>
  );
};

export default TransactionsPage;
