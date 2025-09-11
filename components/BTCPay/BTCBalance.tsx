import { BadgeDollarSign, Bitcoin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { getBTCBalanceInUSD } from "@/lib/actions/btc-actions";

const BTCBalance = async () => {
  const { btcBalance, balanceUSD } = await getBTCBalanceInUSD();

  return (
    <Card className="border bg-white/10 border-gray-600 rounded-xl shadow-lg mt-3 max-w-2xl">
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
        <p className="text-2xl flex items-center gap-2">
          <Bitcoin className="w-6 h-6 text-yellow-300" />
          {btcBalance} BTC
        </p>
        <p className="text-xl flex items-center gap-2">
          ≈ <span className="text-green-500">${balanceUSD.toFixed(2)}</span> USD
        </p>
      </CardContent>
    </Card>
  );
};

export default BTCBalance;
