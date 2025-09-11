import { getStorePayouts } from "@/lib/actions/btc-actions";
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
import ApproveButton from "./PayoutButton";
import { currentUser } from "@clerk/nextjs/server";

const PayoutApprove = async () => {
  const payouts = await getStorePayouts();
  const user = await currentUser();
  if (!user) {
    return <div>User not found</div>;
  }
  const email = user?.emailAddresses[0]?.emailAddress;

  return (
    <Card className="border border-gray-600 rounded-xl shadow-lg mt-3 max-w-7xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          Payouts List
        </CardTitle>
        <CardDescription>
          These are the payouts pending on our server
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="text-right">Approve?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.length > 0 ? (
                payouts
                  .filter((payout) => payout.state === "AwaitingApproval")
                  .map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>{payout.payouts.name}</TableCell>
                      <TableCell>{payout.originalAmount}$</TableCell>
                      <TableCell>{payout.payouts.description}</TableCell>
                      <TableCell className="truncate max-w-xs">
                        {payout.destination}
                      </TableCell>
                      <TableCell className="text-right">
                        <ApproveButton
                          payoutId={payout.id}
                          name={payout.payouts.name}
                          approvedBy={email}
                          amount={payout.originalAmount}
                          description={payout.payouts.description}
                          destination={payout.destination}
                        />
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell className="text-gray-500" colSpan={5}>
                    No payouts available.
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

export default PayoutApprove;
