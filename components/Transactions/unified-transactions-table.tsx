"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedDataTable } from "./unified-data-table";
import { unifiedColumns } from "./unified-columns";
import { normalizeTransactions } from "@/lib/normalize-transactions";

interface UnifiedTransactionsTableProps {
  stripeTransfers: any[];
  paypalTransfers: any[];
  squareTransfers: any[];
  coinbaseTransfers: any[];
  authNetTransfers: any[];
}

const UnifiedTransactionsTable = ({
  stripeTransfers,
  paypalTransfers,
  squareTransfers,
  coinbaseTransfers,
  authNetTransfers,
}: UnifiedTransactionsTableProps) => {
  const [activeTab, setActiveTab] = useState("all");

  // Normalize all transactions to a common format and add source information
  const normalizedStripeTransfers = normalizeTransactions(
    stripeTransfers,
    "stripe"
  );
  const normalizedPaypalTransfers = normalizeTransactions(
    paypalTransfers,
    "paypal"
  );
  const normalizedSquareTransfers = normalizeTransactions(
    squareTransfers,
    "square"
  );
  const normalizedCoinbaseTransfers = normalizeTransactions(
    coinbaseTransfers,
    "coinbase"
  );
  const normalizedAuthNetTransfers = normalizeTransactions(
    authNetTransfers,
    "authorize"
  );

  // Combine all transactions
  const allTransactions = [
    ...normalizedStripeTransfers,
    ...normalizedPaypalTransfers,
    ...normalizedSquareTransfers,
    ...normalizedCoinbaseTransfers,
    ...normalizedAuthNetTransfers,
  ];

  // Sort all transactions by date (newest first)
  allTransactions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Filter transactions based on active tab
  const getFilteredTransactions = () => {
    switch (activeTab) {
      case "stripe":
        return normalizedStripeTransfers;
      case "paypal":
        return normalizedPaypalTransfers;
      case "square":
        return normalizedSquareTransfers;
      case "coinbase":
        return normalizedCoinbaseTransfers;
      case "authorize":
        return normalizedAuthNetTransfers;
      default:
        return allTransactions;
    }
  };

  return (
    <div className="w-full overflow-auto">
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="authorize">Authorize.Net</TabsTrigger>
          <TabsTrigger value="stripe">Stripe</TabsTrigger>
          <TabsTrigger value="paypal">PayPal</TabsTrigger>
          <TabsTrigger value="square">Square</TabsTrigger>
          <TabsTrigger value="coinbase">Coinbase</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-0">
          <UnifiedDataTable
            columns={unifiedColumns}
            data={getFilteredTransactions()}
            source="all"
          />
        </TabsContent>
        <TabsContent value="authorize" className="mt-0">
          <UnifiedDataTable
            columns={unifiedColumns}
            data={getFilteredTransactions()}
            source="authorize"
          />
        </TabsContent>
        <TabsContent value="stripe" className="mt-0">
          <UnifiedDataTable
            columns={unifiedColumns}
            data={getFilteredTransactions()}
            source="stripe"
          />
        </TabsContent>
        <TabsContent value="paypal" className="mt-0">
          <UnifiedDataTable
            columns={unifiedColumns}
            data={getFilteredTransactions()}
            source="paypal"
          />
        </TabsContent>
        <TabsContent value="square" className="mt-0">
          <UnifiedDataTable
            columns={unifiedColumns}
            data={getFilteredTransactions()}
            source="square"
          />
        </TabsContent>
        <TabsContent value="coinbase" className="mt-0">
          <UnifiedDataTable
            columns={unifiedColumns}
            data={getFilteredTransactions()}
            source="coinbase"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedTransactionsTable;
