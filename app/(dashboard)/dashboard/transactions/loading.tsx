import Header from "@/components/General/Header";
import React from "react";

const TransactionsLoad = () => {
  return (
    <section className="p-6 h-screen">
      <Header
        title="Recent Transactions"
        subtext="View your transactions here."
      />
      <div className="flex flex-col gap-4 max-w-3xl">
        <div className="mt-5 animate-pulse">
          <div className="h-80 card-style rounded-lg shadow-md"></div>
        </div>
      </div>
    </section>
  );
};

export default TransactionsLoad;
