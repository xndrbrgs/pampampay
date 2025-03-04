"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function PaypalExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simply open the API route in a new tab or redirect
      window.open("/api/export-transfers/paypal", "_blank");
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isExporting} className="w-[20rem]">
      {isExporting
        ? "Exporting..."
        : `Export Paypal Transfers - (${new Date().toLocaleString("default", {
            month: "long",
          })} 1-${new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0
          ).getDate()}, ${new Date().getFullYear()})`}
    </Button>
  );
}
