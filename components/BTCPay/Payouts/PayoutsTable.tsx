import { getCompletedPayouts } from "@/lib/actions/btc-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const PayoutsTable = async () => {
  const payouts = await getCompletedPayouts();
  return (
    <Card className="border bg-white/10 border-gray-600 rounded-xl shadow-lg mt-3 max-w-7xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          Today's Payouts
        </CardTitle>
        <CardDescription>
          A list of all payouts processed in the last 48 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>When?</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.length > 0 ? (
                payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>{payout.name}</TableCell>
                    <TableCell>{payout.amount}$</TableCell>
                    <TableCell>{payout.address}</TableCell>
                    <TableCell>{payout.createdAt.toLocaleString()}</TableCell>
                    <TableCell className="truncate max-w-xs">
                      {payout.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="black">{payout.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="text-gray-500" colSpan={5}>
                    No recent payouts.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayoutsTable;
