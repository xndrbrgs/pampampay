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
  
  interface ConnectedTableProps {
    transfers: {
      id: string;
      amount: number;
      description: string;
      updatedAt: string;
      status: string;
    }[];
  }
  
  const ConnectedTable = ({ transfers }: ConnectedTableProps) => {
    return (
      <div className="w-full overflow-auto">
        <Table>
          <TableCaption>A list of your recent transfers.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[6.25rem]">Amount</TableHead>
              <TableHead className="hidden lg:table-cell">Description</TableHead>
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers
              .slice()
              .reverse()
              .map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell>{formatAmount(transfer.amount)}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {transfer.description}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {transfer.transaction.source?.receipt_email}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatDateTime(new Date(transfer.updatedAt)).dateTime}
                  </TableCell>
                  <TableCell className="text-right capitalize">
                    {transfer.status}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  export default ConnectedTable;
  