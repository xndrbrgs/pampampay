// This function normalizes transactions from different payment processors
// into a unified format for display in the combined table

import type { UnifiedTransaction } from "@/components/Transactions/unified-columns";

export function normalizeTransactions(
  transactions: any[],
  source: "stripe" | "paypal" | "square" | "coinbase" | "authorize"
): UnifiedTransaction[] {
  if (!transactions || !Array.isArray(transactions)) {
    return [];
  }

  return transactions.map((transaction) => {
    // Base transaction object with common properties
    const baseTransaction: UnifiedTransaction = {
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description || "",
      createdAt: transaction.createdAt,
      status: transaction.status,
      email: "",
      source,
    };

    // Source-specific normalizations
    switch (source) {
      case "stripe":
        // Updated to match your Stripe data structure
        baseTransaction.email =
          transaction.senderEmail ||
          transaction.transaction?.source?.receipt_email ||
          transaction.customerEmail ||
          "N/A";
        break;

      case "authorize":
        baseTransaction.email = transaction.senderEmail ?? "N/A";
        break;

      case "paypal":
        baseTransaction.email =
          transaction.senderEmail || transaction.payer?.email_address || "N/A";
        break;

      case "square":
        baseTransaction.email =
          transaction.senderEmail || transaction.buyerEmail || "N/A";
        break;

      case "coinbase":
        baseTransaction.email =
          transaction.senderEmail ||
          transaction.transaction?.source?.receipt_email ||
          "N/A";
        break;
    }

    return baseTransaction;
  });
}
