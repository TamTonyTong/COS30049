"use client";

import Header from "@/src/components/header";
import BuyingForm from "@/src/components/trading/transactions/buying-form";

export default function BuyingPage() {
  return (
    <main className="container px-4 py-8 mx-auto">
      <Header />
        <BuyingForm />
    </main>
  );
}
