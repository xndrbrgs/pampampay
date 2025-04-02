import { SquareTransfer } from "@prisma/client";
import { SquareTable } from "./data-table";
import { squareColumns } from "./columns";

interface SquareTableProps {
  transfers: SquareTransfer[];
}

const SquareDataTable = ({ transfers }: SquareTableProps) => {
  return (
    <div className="w-full overflow-auto">
      <div className="flex flex-col mb-4">
        <h2 className="text-xl">Square Transactions</h2>
        <p className="text-sm text-gray-400">
          View your Square transactions here.
        </p>
      </div>
      <SquareTable columns={squareColumns} data={transfers.slice().reverse()} />
    </div>
  );
};

export default SquareDataTable;
