"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function BuyingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const price = searchParams.get("price") || "";
  const amount = searchParams.get("amount") || "";
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const handleConfirmOrder = () => {
    if (!cardNumber || !expiryDate || !cvv) {
      alert("Please fill in all payment details.");
      return;
    }

    setPaymentStatus("Processing payment...");
    setTimeout(() => {
      const isPaymentSuccessful = Math.random() > 0.5;
      if (isPaymentSuccessful) {
        setPaymentStatus("Payment successful! Your order has been placed.");
        alert(`Order placed: Buying ${amount} BTC at $${price}`);
        router.push("/trade");
      } else {
        setPaymentStatus("Payment failed. Please try again.");
      }
    }, 2000);
  };

  return (
    <div className="flex justify-center mt-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Confirm Buy Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="buy-price">Price</Label>
            <Input id="buy-price" type="number" value={price} disabled />
          </div>
          <div>
            <Label htmlFor="buy-amount">Amount</Label>
            <Input id="buy-amount" type="number" value={amount} disabled />
          </div>
          <div>
            <Label htmlFor="card-number">Card Number</Label>
            <Input
              id="card-number"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry-date">Expiration Date</Label>
              <Input
                id="expiry-date"
                type="text"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
              />
            </div>
          </div>
          {paymentStatus && <div className="text-center text-sm">{paymentStatus}</div>}
          <Button className="w-full bg-green-500 hover:bg-green-600" onClick={handleConfirmOrder}>
            Pay Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BuyingPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <BuyingForm />
      </Suspense>
    </main>
  );
}
