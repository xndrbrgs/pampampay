import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAmount, formatDateTime } from "@/lib/utils";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  receiver: { email: string };
  updatedAt: string;
  status: string;
}

interface TransactionsTableProps {
  receivedTransfers: Transaction[];
  sentTransfers: Transaction[];
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  receivedTransfers,
  sentTransfers,
}) => {
  return (
    <section className="w-full">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl">Transfers Sent</h2>
        <Table>
          <TableCaption>A list of your recent sent transfers.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[6.25rem]">Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Sent To</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sentTransfers
              .slice()
              .reverse()
              .map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium text-red-500">
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.receiver.email}</TableCell>
                  <TableCell>
                    {formatDateTime(transaction.updatedAt).dateTime}
                  </TableCell>
                  <TableCell className="text-right capitalize">
                    {transaction.status}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl">Transfers Received</h2>
        <Table>
          <TableCaption>A list of your recent received transfers.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[6.25rem]">Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Sent From</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receivedTransfers
              .slice()
              .reverse()
              .map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium text-green-500">
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.receiver.email}</TableCell>
                  <TableCell>
                    {formatDateTime(transaction.updatedAt).dateTime}
                  </TableCell>
                  <TableCell className="text-right capitalize">
                    {transaction.status}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default TransactionsTable;
