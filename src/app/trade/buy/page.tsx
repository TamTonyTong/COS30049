"use client";

import Header from "@/components/header";
import BuyingForm from "@/components/trading/buying-form";

export default function BuyingPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Header />
        <BuyingForm />
    </main>
  );
}
