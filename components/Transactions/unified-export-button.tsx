"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback } from "react";

interface UnifiedExportButtonProps {
  source: string;
}

// Replace the generateMonthOptions function with this updated version
const generateMonthOptions = () => {
  const months = [];
  const startYear = 2025;
  const startMonth = 0; // January (0-indexed)

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Generate months from January 2025 to current month
  for (let year = startYear; year <= currentYear; year++) {
    // Determine the range of months for this year
    const firstMonth = year === startYear ? startMonth : 0;
    const lastMonth = year === currentYear ? currentMonth : 11;

    for (let month = firstMonth; month <= lastMonth; month++) {
      const date = new Date(year, month, 1);
      const monthName = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      months.push({
        value: `${month}-${year}`,
        label: monthName,
      });
    }
  }

  // Sort in reverse chronological order (newest first)
  months.reverse();

  return months;
};

const monthOptions = generateMonthOptions();

export default function UnifiedExportButton({
  source,
}: UnifiedExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      // Parse the selected month value
      const [monthIndex, year] = selectedMonth.split("-").map(Number);

      // If source is "all", export all transactions
      if (source === "all") {
        window.open(
          `/api/export-transfers/all?month=${monthIndex}&year=${year}`,
          "_blank"
        );
      } else {
        // Otherwise export only the selected source
        window.open(
          `/api/export-transfers/${source}?month=${monthIndex}&year=${year}`,
          "_blank"
        );
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }, [source, selectedMonth]);

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select month" />
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleExport} disabled={isExporting} variant="black">
        {isExporting
          ? "Exporting..."
          : `Export ${source === "all" ? "All" : source} Transactions`}
      </Button>
    </div>
  );
}