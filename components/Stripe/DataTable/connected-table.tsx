import { columns, type Transfer } from "./columns";
import { DataTable } from "./data-table";

interface ConnectedTableProps {
  transfers: Transfer[];
}

const ConnectedDataTable = ({ transfers }: ConnectedTableProps) => {
  return (
    <div className="w-full overflow-auto">
      <div className="flex flex-col mb-4">
        <h2 className="text-xl">Stripe Transactions</h2>
        <p className="text-sm text-gray-400">
          View your Stripe transactions here.
        </p>
      </div>
      <DataTable columns={columns} data={transfers.slice().reverse()} />
    </div>
  );
};

export default ConnectedDataTable;
