import ConnectedDataTable from "@/components/Stripe/DataTable/connected-table";
import Header from "@/components/General/Header";
import { getUserStripeTransactions } from "@/lib/actions/transfer.actions";
import { createOrGetUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import PaypalDataTable from "@/components/Paypal/DataTable/connected-table";
import { getPayPalTransactions } from "@/lib/paypal";
import SquareDataTable from "@/components/Square/DataTable/connected-table";
import { getSquareTransactions } from "@/lib/actions/square.actions";
import CoinbaseDataTable from "@/components/Coinbase/DataTable/connected-table";
import { getCoinbaseCharges } from "@/lib/coinbase";

const TransactionsPage = async () => {
  const user = await createOrGetUser();
  if (user.stripeConnectedLinked === false) {
    redirect("/dashboard");
  }

  const [stripeTransfers, paypalTransfers, squareTransfers, coinbaseTransfers] = await Promise.all([
    getUserStripeTransactions(),
    getPayPalTransactions(),
    getSquareTransactions(),
    getCoinbaseCharges(),
  ]);

  return (
    <section className="p-6 h-full gap-y-4">
      <Header
        title="Recent Transactions"
        subtext="View your transactions here."
      />
      <div className="flex flex-col gap-y-4">
        <ConnectedDataTable transfers={stripeTransfers} />
        <PaypalDataTable transfers={paypalTransfers} />
        <SquareDataTable transfers={squareTransfers} />
        <CoinbaseDataTable transfers={coinbaseTransfers} />
      </div>
    </section>
  );
};

export default TransactionsPage;
