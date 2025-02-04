"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import TradingChart from "@/components/trading-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import 'boxicons'
interface Order {
  id: string;
  type: "buy" | "sell";
  pair: string;
  price: string;
  amount: string;
  timestamp: string;
}

export default function TradingPage() {
  const router = useRouter();
  const [orderType, setOrderType] = useState<string>("buy");
  const [price, setPrice] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [tradingPair, setTradingPair] = useState<string>("bitcoin");
  const [orders, setOrders] = useState<Order[]>([]); // State to store order history

  // Load orders from localStorage on component mount
  useEffect(() => {
    const savedOrders = localStorage.getItem("orders");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Extract the base currency (e.g., BTC, ETH) from the trading pair
  const Currency = tradingPair;
  const baseCurrency = Currency.charAt(0).toUpperCase() + Currency.slice(1);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    // Validate inputs
    if (!price || !amount) {
      alert("Please enter both price and amount.");
      return;
    }

    // Navigate to the buy/sell page with query parameters
    router.push(
      `/trade/${orderType}?pair=${tradingPair}&price=${price}&amount=${amount}`
    );
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
            <TradingChart tradingPair={tradingPair} />
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Place Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Trading Pair Selector */}
                <div className="mb-4">
                  <Label>Trading Pair</Label>
                  <Select value={tradingPair} onValueChange={setTradingPair}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Pair" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bitcoin">BTC/USD</SelectItem>
                      <SelectItem value="ethereum">ETH/USD</SelectItem>
                      <SelectItem value="bnbusdt">BNB/USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Tabs defaultValue="buy" className="w-full" onValueChange={setOrderType}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buy">Buy</TabsTrigger>
                    <TabsTrigger value="sell">Sell</TabsTrigger>
                  </TabsList>
                  <TabsContent value="buy">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div>
                        <Label htmlFor="buy-price">Price</Label>
                        <Input
                          id="buy-price"
                          type="number"
                          placeholder="0.00"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          required
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
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 font-sans text-1xl">
                        Buy {baseCurrency}
                      </Button>
                    </form>
                  </TabsContent>
                  <TabsContent value="sell">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div>
                        <Label htmlFor="sell-price">Price</Label>
                        <Input
                          id="sell-price"
                          type="number"
                          placeholder="0.00"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          required
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
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-red-500 hover:bg-red-600 font-sans text-1xl">
                        Sell {baseCurrency}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Order History Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground">No orders yet.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border p-4 rounded-lg">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {order.type === "buy" ? "Buy" : "Sell"} {order.pair.toUpperCase()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {order.timestamp}
                          </span>
                        </div>
                        <div className="text-sm">
                          <p>Price: ${order.price}</p>
                          <p>Amount: {order.amount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}