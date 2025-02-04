"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function SellingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const price = searchParams.get("price") || "";
  const amount = searchParams.get("amount") || "";

  const handleConfirmOrder = () => {
    if (!price || !amount) {
      alert("Please enter both price and amount.");
      return;
    }
  
    // Create the sell order object
    const newOrder = {
      id: Date.now().toString(),
      type: "sell",
      pair: "BTC/USD",
      price: price,
      amount: amount,
      timestamp: new Date().toLocaleString(),
    };
  
    // Retrieve existing orders from localStorage
    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
  
    // Save the updated orders back to localStorage
    localStorage.setItem("orders", JSON.stringify([...existingOrders, newOrder]));
  
    alert(`Order placed: Selling ${amount} BTC at $${price}`);
    router.push("/trade");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Confirm Sell Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="sell-price">Price</Label>
          <Input id="sell-price" type="number" value={price} disabled />
        </div>
        <div>
          <Label htmlFor="sell-amount">Amount</Label>
          <Input id="sell-amount" type="number" value={amount} disabled />
        </div>
        <Button className="w-full bg-red-500 hover:bg-red-600" onClick={handleConfirmOrder}>
          Confirm Sell Order
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SellingPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Header />
      <div className="flex justify-center mt-8">
        <Suspense fallback={<div>Loading...</div>}>
          <SellingForm />
        </Suspense>
      </div>
    </main>
  );
}
