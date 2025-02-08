import type React from "react";
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
  const renderTable = (
    transactions: Transaction[],
    type: "sent" | "received"
  ) => (
    <div className="w-full overflow-auto">
      <Table>
        <TableCaption>A list of your recent {type} transfers.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[6.25rem]">Amount</TableHead>
            <TableHead className="hidden lg:table-cell">Description</TableHead>
            <TableHead className="hidden lg:table-cell">
              {type === "sent" ? "Sent To" : "Sent From"}
            </TableHead>
            <TableHead className="hidden lg:table-cell">Date</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions
            .slice()
            .reverse()
            .map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell
                  className={`font-medium ${
                    type === "sent" ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {formatAmount(transaction.amount)}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {transaction.description}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {transaction.receiver.email}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
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
  );

  const renderMobileDetails = (
    transactions: Transaction[],
    type: "sent" | "received"
  ) => (
    <div className="space-y-4 lg:hidden">
      {transactions
        .slice()
        .reverse()
        .map((transaction) => (
          <div
            key={transaction.id}
            className="card-style p-4 rounded-lg shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <span
                className={`font-medium ${
                  type === "sent" ? "text-red-500" : "text-green-500"
                }`}
              >
                {formatAmount(transaction.amount)}
              </span>
              <span className="text-sm text-muted-foreground capitalize">
                {transaction.status}
              </span>
            </div>
            <div className="text-sm">{transaction.description}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {type === "sent" ? "Sent to: " : "Received from: "}
              {transaction.receiver.email}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {formatDateTime(transaction.updatedAt).dateTime}
            </div>
          </div>
        ))}
    </div>
  );

  return (
    <section className="w-full space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl">Transfers Sent</h2>
        {renderTable(sentTransfers, "sent")}
        {renderMobileDetails(sentTransfers, "sent")}
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl">Transfers Received</h2>
        {renderTable(receivedTransfers, "received")}
        {renderMobileDetails(receivedTransfers, "received")}
      </div>
    </section>
  );
};

export default TransactionsTable;
