"use client";

import { Button } from "@/components/ui/button";
import { fetchActiveMonths } from "@/lib/actions/user.actions";
import { useState } from "react";
import { useEffect } from "react";

export default function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  useEffect(() => {
    const getActiveMonths = async () => {
      try {
        const activeMonths = await fetchActiveMonths();
        setMonths(activeMonths.squareTransfers);
      } catch (error) {
        console.error("Failed to fetch active months:", error);
      }
    };

    getActiveMonths();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simply open the API route in a new tab or redirect
      window.open(
        `/api/export-transfers/square?month=${selectedMonth}`,
        "_blank"
      );
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(event.target.value));
  };

  return (
    <div>
      <select
        value={selectedMonth}
        onChange={handleMonthChange}
        className="mr-5 p-2 border rounded"
      >
        {months.map((month, index) => (
          <option key={index} value={index}>
            {month}
          </option>
        ))}
      </select>
      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="w-[20rem]"
      >
        {isExporting ? "Exporting..." : "Export Square Transfers"}
      </Button>
    </div>
  );
}
