import Header from "@/components/General/Header";
import { getUserStripeTransactions } from "@/lib/actions/transfer.actions";
import { createOrGetUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { getPayPalTransactions } from "@/lib/paypal";
import { getSquareTransactions } from "@/lib/actions/square.actions";
import { getCoinbaseCharges } from "@/lib/coinbase";
import UnifiedTransactionsTable from "@/components/Transactions/unified-transactions-table";

const TransactionsPage = async () => {
  const user = await createOrGetUser();
  if (user.stripeConnectedLinked === false) {
    redirect("/dashboard");
  }

  const [stripeTransfers, paypalTransfers, squareTransfers, coinbaseTransfers] =
    await Promise.all([
      getUserStripeTransactions(),
      getPayPalTransactions(),
      getSquareTransactions(),
      getCoinbaseCharges(),
    ]);

  return (
    <section className="p-6 h-screen gap-y-4">
      <Header
        title="Recent Transactions"
        subtext="View your transactions here."
      />
      <UnifiedTransactionsTable
        stripeTransfers={stripeTransfers}
        paypalTransfers={paypalTransfers}
        squareTransfers={squareTransfers}
        coinbaseTransfers={coinbaseTransfers}
      />
    </section>
  );
};

export default TransactionsPage;
