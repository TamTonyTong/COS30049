"use client";

import Header from "@/components/header";
import TradingChart from "@/components/trading-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation"; // Correct import for Next.js 13+
import { useState } from "react";

export default function TradingPage() {
  const router = useRouter();
  const [orderType, setOrderType] = useState<string>("buy");
  const [price, setPrice] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/trade/${orderType}?price=${price}&amount=${amount}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Header />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TradingChart />
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Place Order</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="buy" className="w-full" onValueChange={setOrderType}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buy">Buy</TabsTrigger>
                    <TabsTrigger value="sell">Sell</TabsTrigger>
                  </TabsList>
                  <TabsContent value="buy">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div>
                        <Label htmlFor="buy-price">Price</Label>
                        <Input id="buy-price" type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="buy-amount">Amount</Label>
                        <Input id="buy-amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                      </div>
                      <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">Buy BTC</Button>
                    </form>
                  </TabsContent>
                  <TabsContent value="sell">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div>
                        <Label htmlFor="sell-price">Price</Label>
                        <Input id="sell-price" type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="sell-amount">Amount</Label>
                        <Input id="sell-amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                      </div>
                      <Button type="submit" className="w-full bg-red-500 hover:bg-red-600">Sell BTC</Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
