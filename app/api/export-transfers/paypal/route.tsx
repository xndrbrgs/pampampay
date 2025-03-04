// app/api/export-transfers/route.ts
import * as XLSX from "xlsx";
import { startOfMonth, endOfMonth } from "date-fns";
import prisma from "@/lib/db";

export async function GET() {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const transfers = await prisma.paypalTransfer.findMany({
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
    .filter((transfer: any) => transfer.status === "COMPLETED")
    .map((transfer: any) => ({
      Amount: transfer.amount,
      Total: transfer.amount,
      Description: transfer.description,
      Sender: transfer.sender.email,
      Status: transfer.status,
      CreatedAt: transfer.createdAt,
    }));

  const totalAmount = data.reduce((sum, transfer) => sum + transfer.Amount, 0);
  data.sort(
    (a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
  );

  data.push({
    Amount: "Total",
    Total: totalAmount,
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

  const formattedDate = `${
    now.getMonth() + 1
  }_${start.getDate()}_${end.getDate()}_${now.getFullYear()}`;
  const fileName = `PPP_${formattedDate}_PPTransfers.xlsx`;

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
