"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatAmount, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Unified transaction type that works for all payment processors
export type UnifiedTransaction = {
  id: string;
  amount: number;
  description: string;
  createdAt: string;
  status: string;
  email: string;
  source: "stripe" | "btcpay" | "paypal" | "square" | "coinbase" | "authorize";
};

export const unifiedColumns: ColumnDef<UnifiedTransaction>[] = [
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium text-green-500">
        {formatAmount(row.getValue("amount"))}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="hidden md:block">
        {row.getValue("description") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.getValue("email") || "N/A"}</div>,
    filterFn: (row, id, value) => {
      const email = row.getValue(id) as string;
      return email?.toLowerCase().includes(value.toLowerCase()) ?? false;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="hidden sm:block">
        {formatDateTime(new Date(row.getValue("createdAt"))).dateTime}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="uppercase">
        <Badge>
          {row.original.source === "coinbase" && (
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
          )}
          {row.getValue("status")}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => {
      const source = row.getValue("source") as string;
      return (
        <Badge variant="outline" className="capitalize">
          {source}
        </Badge>
      );
    },
  },
];
