"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatAmount, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type PaypalTransfer = {
  id: string;
  amount: number;
  description: string;
  createdAt: string;
  status: string;
  senderEmail: string;
  transaction: {
    source?: {
      receipt_email?: string;
    };
  };
};

export const paypalColumns: ColumnDef<PaypalTransfer>[] = [
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
      <div className="hidden md:block">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.original.senderEmail || "N/A"}</div>,
    filterFn: (row, id, value) => {
      const email = row.original.senderEmail;
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
      <div className="capitalize">
        <Badge>{row.getValue("status")}</Badge>
      </div>
    ),
  },
];
