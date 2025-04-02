import { columns, type CoinbaseTransfer } from "./columns";
import { DataTable } from "./data-table";

interface CoinbaseTableProps {
  transfers: CoinbaseTransfer[];
}

const CoinbaseDataTable = ({ transfers }: CoinbaseTableProps) => {
  return (
    <div className="w-full overflow-auto">
      <div className="flex flex-col mb-4">
        <h2 className="text-xl">Coinbase Transactions</h2>
        <p className="text-sm text-gray-400">
          View your Coinbase transactions here.
        </p>
      </div>
      <DataTable columns={columns} data={transfers} />
    </div>
  );
};

export default CoinbaseDataTable;
