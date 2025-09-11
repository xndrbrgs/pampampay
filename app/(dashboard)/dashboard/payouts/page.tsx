import { BTCPayoutForm } from "@/components/BTCPay/BTCPayoutForm";
import BTCBalance from "@/components/BTCPay/BTCBalance";
import PayoutApprove from "@/components/BTCPay/Payouts/PayoutApprove";
import Header from "@/components/General/Header";
import { PayPalProvider } from "@/components/Paypal/PaypalProvider";
import { getConnections, getPayoutAdmins } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import PayoutsTable from "@/components/BTCPay/Payouts/PayoutsTable";
import { BTCRefill } from "@/components/BTCPay/Payouts/BTCRefill";

export default async function PayoutsPage() {
  const user = await currentUser();
  if (!user) {
    return <div>User not found</div>;
  }
  const userEmail = user.emailAddresses[0]?.emailAddress;
  const payoutAdmin = await getPayoutAdmins();
  const connections = await getConnections();

  if (payoutAdmin?.[0]?.canSeePayouts !== true) {
    return (
      <PayPalProvider>
        <div className="p-6 h-screen">
          <Header
            title="Request your payout!"
            subtext="Request BTC payouts with ease in RLC Pay"
          />
          <div className="mt-6 max-w-7xl">
            <BTCPayoutForm email={userEmail} />
          </div>
        </div>
      </PayPalProvider>
    );
  } else {
    return (
      <div className="p-6 h-full">
        <Header
          title="Admin Payout Dashboard"
          subtext="Confirm customer payouts with ease"
        />
        <div className="mt-6 max-w-7xl">
          <BTCBalance />
          <BTCRefill connections={connections} />
          <PayoutApprove />
          <PayoutsTable />
        </div>
      </div>
    );
  }
}
