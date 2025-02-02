"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function SellingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [price, setPrice] = useState<string>(searchParams.get("price") || "");
  const [amount, setAmount] = useState<string>(searchParams.get("amount") || "");

  const handleConfirmOrder = () => {
    // Validate inputs
    if (!price || !amount) {
      alert("Please enter both price and amount.");
      return;
    }

    // Confirm the sell order
    alert(`Order placed: Selling ${amount} BTC at $${price}`);
    router.push("/trade"); // Navigate back to the trading page
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Header />
      <div className="flex justify-center mt-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Confirm Sell Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sell-price">Price</Label>
              <Input
                id="sell-price"
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="sell-amount">Amount</Label>
              <Input
                id="sell-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled
              />
            </div>
            <Button
              className="w-full bg-red-500 hover:bg-red-600"
              onClick={handleConfirmOrder}
            >
              Confirm Sell Order
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}