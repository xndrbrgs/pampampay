import Header from "@/components/General/Header";
import React from "react";

const LoadingFile = () => {
  return (
    <section className="p-6 h-screen">
      <Header
        title="Transfer Money"
        subtext="Manage your transfers easily and safely."
      />
      <div className="flex flex-col gap-4 max-w-3xl">
        <div className="mt-5 animate-pulse">
          <div className="h-64 card-style rounded-lg shadow-md"></div>
        </div>
      </div>
    </section>
  );
};

export default LoadingFile;
