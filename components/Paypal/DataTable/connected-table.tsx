import { paypalColumns, type PaypalTransfer } from "./columns";
import { PaypalTable } from "./data-table";

interface PaypalTableProps {
  transfers: PaypalTransfer[];
}

const PaypalDataTable = ({ transfers }: PaypalTableProps) => {
  return (
    <div className="w-full overflow-auto">
      <div className="flex flex-col mb-4">
        <h2 className="text-xl">PayPal Transactions</h2>
        <p className="text-sm text-gray-400">
          View your PayPal transactions here.
        </p>
      </div>
      <PaypalTable columns={paypalColumns} data={transfers.slice().reverse()} />
    </div>
  );
};

export default PaypalDataTable;
