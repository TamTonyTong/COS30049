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
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const handleConfirmOrder = () => {
    // Validate payment details
    if (!cardNumber || !expiryDate || !cvv) {
      alert("Please fill in all payment details.");
      return;
    }

    // Simulate payment processing
    setPaymentStatus("Processing payment...");
    setTimeout(() => {
      const isPaymentSuccessful = Math.random() > 0.5; // Randomly simulate success or failure
      if (isPaymentSuccessful) {
        setPaymentStatus("Payment successful! Your order has been placed.");
        alert(`Order placed: Buying ${amount} BTC at $${price}`);
      } else {
        setPaymentStatus("Payment failed. Please try again.");
      }
    }, 2000); // Simulate a 2-second delay
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
                disabled // Disable editing since it's passed from the previous page
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
                disabled // Disable editing since it's passed from the previous page
              />
            </div>

            {/* Payment Details */}
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

            {/* Payment Status */}
            {paymentStatus && (
              <div className="text-center text-sm">
                {paymentStatus}
              </div>
            )}

            <Button className="w-full bg-green-500 hover:bg-green-600" onClick={handleConfirmOrder}>
              Pay Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}