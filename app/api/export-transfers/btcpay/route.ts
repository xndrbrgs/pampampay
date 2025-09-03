// app/api/export-transfers/route.ts
import * as XLSX from "xlsx";
import { startOfMonth, endOfMonth } from "date-fns";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  const now = new Date();
  const { searchParams } = new URL(request.url);
  const month = searchParams.has("month")
    ? parseInt(searchParams.get("month")!)
    : now.getMonth() + 1;
  const year = searchParams.has("year")
    ? parseInt(searchParams.get("year")!)
    : now.getFullYear();
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));

  const transfers = await prisma.bTCTransfer.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      sender: true,
      receiver: true,
    },
  });

  const data = transfers
    .filter((transfer: any) => transfer.status === "Settled")
    .map((transfer: any) => ({
      Amount: transfer.amount,
      Total: transfer.amount,
      Description: transfer.description,
      Sender: transfer.sender.email,
      Status: transfer.status,
      CreatedAt: transfer.createdAt,
    }));

  const btcFeePercentage = 0.0025; // BTC fee percentage (0.25%)
  const btcFlatFee = 0.06; // BTC flat fee ($0.06 per transaction)

  const netAmount = data.reduce((sum, transfer) => {
    const fee = transfer.Amount * btcFeePercentage + btcFlatFee;
    return sum + (transfer.Amount - fee);
  }, 0);

  data.push({
    Amount: "Net Amount",
    Total: netAmount,
    Description: "",
    Sender: "",
    Status: "",
    CreatedAt: "",
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const columnWidths = [
    { wch: 10 }, // Amount
    { wch: 10 }, // Total
    { wch: 10 }, // Description
    { wch: 30 }, // Sender
    { wch: 15 }, // Status
    { wch: 20 }, // CreatedAt
  ];
  worksheet["!cols"] = columnWidths;

  // Apply header formatting
  const headerRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = {
      font: { bold: true, sz: 14 }, // Set font size to 14
      alignment: { horizontal: "center" },
    };
  }

  // Apply number formatting to amount columns
  for (let R = 1; R <= headerRange.e.r; ++R) {
    const amountCell = XLSX.utils.encode_cell({ r: R, c: 0 });
    const totalCell = XLSX.utils.encode_cell({ r: R, c: 1 });
    if (worksheet[amountCell]) worksheet[amountCell].z = "$#,##0.00";
    if (worksheet[totalCell]) worksheet[totalCell].z = "$#,##0.00";
  }

  const workbook = XLSX.utils.book_new();
  const sheetName = `${start.toLocaleString("default", {
    month: "long",
  })} ${start.getFullYear()} - Transfers`;
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const fileName = `BTCTransfers.xlsx`;

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
