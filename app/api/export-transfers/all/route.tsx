import { type NextRequest, NextResponse } from "next/server";
import { getUserStripeTransactions } from "@/lib/actions/transfer.actions";
import { getPayPalTransactions } from "@/lib/paypal";
import { getSquareTransactions } from "@/lib/actions/square.actions";
import { getCoinbaseCharges } from "@/lib/coinbase";
import { normalizeTransactions } from "@/lib/normalize-transactions";
import { createOrGetUser } from "@/lib/actions/user.actions";

export async function GET(request: NextRequest) {
  try {
    const user = await createOrGetUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get("month");

    // Fetch all transactions
    const [
      stripeTransfers,
      paypalTransfers,
      squareTransfers,
      coinbaseTransfers,
    ] = await Promise.all([
      getUserStripeTransactions(),
      getPayPalTransactions(),
      getSquareTransactions(),
      getCoinbaseCharges(),
    ]);

    // Normalize all transactions
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

    // Combine all transactions
    const allTransactions = [
      ...normalizedStripeTransfers,
      ...normalizedPaypalTransfers,
      ...normalizedSquareTransfers,
      ...normalizedCoinbaseTransfers,
    ];

    // Sort by date (newest first)
    allTransactions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Filter by month and year if specified
    let filteredTransactions = allTransactions;
    if (month) {
      const monthIndex = Number.parseInt(month);
      const year = searchParams.get("year")
        ? Number.parseInt(searchParams.get("year")!)
        : new Date().getFullYear();

      filteredTransactions = allTransactions.filter((transaction) => {
        const date = new Date(transaction.createdAt);
        return date.getMonth() === monthIndex && date.getFullYear() === year;
      });
    }

    // Generate CSV content
    const headers = [
      "Date",
      "Amount",
      "Description",
      "Email",
      "Status",
      "Source",
    ];
    const rows = filteredTransactions.map((transaction) => [
      new Date(transaction.createdAt).toLocaleDateString(),
      (transaction.amount / 100).toFixed(2), // Assuming amount is in cents
      transaction.description || "N/A",
      transaction.email || "N/A",
      transaction.status,
      transaction.source,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Set headers for CSV download
    const headers_res = new Headers();
    headers_res.set("Content-Type", "text/csv");
    headers_res.set(
      "Content-Disposition",
      `attachment; filename="all-transactions.csv"`
    );

    return new NextResponse(csvContent, {
      status: 200,
      headers: headers_res,
    });
  } catch (error) {
    console.error("Error exporting transactions:", error);
    return NextResponse.json(
      { error: "Failed to export transactions" },
      { status: 500 }
    );
  }
}
