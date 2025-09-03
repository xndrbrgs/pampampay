import { BadgeDollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { getBTCPayBalances } from "@/lib/actions/btc-actions";

const BTCBalance = async () => {
  const balances = await getBTCPayBalances();

  console.log("BTC Balances:", balances);

  return (
    <Card className="border border-gray-600 rounded-xl shadow-lg mt-3 max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          BTC Balance
          <BadgeDollarSign className="w-6 h-6" />
        </CardTitle>
        <CardDescription>
          This is the balance we currently have on our BTC server
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <p>On-chain confirmed: {balances.onchainData.confirmedBalance} BTC</p>
        <p>On-chain unconfirmed: {balances.onchainData.unconfirmedBalance} BTC</p>
      </CardContent>
    </Card>
  );
};

export default BTCBalance;
