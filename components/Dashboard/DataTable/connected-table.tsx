import { columns, type Transfer } from "./columns"
import { DataTable } from "./data-table"

interface ConnectedTableProps {
  transfers: Transfer[]
}

const ConnectedDataTable = ({ transfers }: ConnectedTableProps) => {
  return (
    <div className="w-full overflow-auto">
      <DataTable columns={columns} data={transfers.slice().reverse()} />
    </div>
  )
}

export default ConnectedDataTable

