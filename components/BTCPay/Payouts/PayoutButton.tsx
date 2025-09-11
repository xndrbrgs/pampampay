"use client";

import { Button } from "@/components/ui/button";
import { approvePayout } from "@/lib/actions/btc-actions";
import { useState } from "react";

export default function ApproveButton({
  payoutId,
  name,
  approvedBy,
  amount,
  description,
  destination,
}: {
  payoutId: string;
  name: string;
  approvedBy: string;
  amount: string;
  description: string;
  destination: string;
}) {
  const [loading, setLoading] = useState(false);
  console.log(payoutId, name, amount, description, destination, approvedBy);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approvePayout(
        payoutId,
        name,
        amount,
        description,
        destination,
        approvedBy
      );
      alert("Payout approved successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error approving payout:", error);
      alert("Failed to approve payout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="submit"
      className="hover:cursor-pointer"
      onClick={handleApprove}
      disabled={loading}
    >
      {loading ? "Approving..." : "Approve"}
    </Button>
  );
}
