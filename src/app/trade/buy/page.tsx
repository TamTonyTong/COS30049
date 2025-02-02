"use client";

import { useSearchParams } from "next/navigation";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function BuyingPage() {
  const searchParams = useSearchParams();
  const [price, setPrice] = useState<string>(searchParams.get("price") || "");
  const [amount, setAmount] = useState<string>(searchParams.get("amount") || "");

  const handleConfirmOrder = () => {
    alert(`Order placed: Buying ${amount} BTC at $${price}`);
    // Implement API call to process the trade here
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Header />
      <div className="flex justify-center mt-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Confirm Buy Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="buy-price">Price</Label>
              <Input 
                id="buy-price" 
                type="number" 
                placeholder="0.00" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="buy-amount">Amount</Label>
              <Input 
                id="buy-amount" 
                type="number" 
                placeholder="0.00" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
              />
            </div>
            <Button className="w-full bg-green-500 hover:bg-green-600" onClick={handleConfirmOrder}>
              Confirm Buy Order
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
