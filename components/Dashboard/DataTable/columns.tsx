"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatAmount, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export type Transfer = {
  id: string;
  amount: number;
  description: string;
  createdAt: string;
  status: string;
  transaction: {
    source?: {
      receipt_email?: string;
    };
  };
};

export const columns: ColumnDef<Transfer>[] = [
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
      <div className="font-medium">{formatAmount(row.getValue("amount"))}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="hidden md:block">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div>{row.original.transaction.source?.receipt_email || "N/A"}</div>
    ),
    filterFn: (row, id, value) => {
      return (
        row.original.transaction.source?.receipt_email
          ?.toLowerCase()
          .includes(value.toLowerCase()) ?? false
      );
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
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  },
];
