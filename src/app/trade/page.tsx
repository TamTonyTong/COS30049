/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/src/components/header";
import TradingChart from "@/src/components/trading/trading-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { fakeSmartContract } from "@/src/components/trading/transactions/fake-smart-contract-real";
import TradeHistory from "@/src/components/trading/transactions/trading-history";
interface Order {
  id: string;
  type: "buy" | "sell";
  pair: string;
  price: string;
  amount: string;
  timestamp: string;
}

export default function TradingPage(this: any) {
  const router = useRouter();
  const [orderType, setOrderType] = useState<string>("buy");
  const [price, setPrice] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [tradingPair, setTradingPair] = useState<string>("bitcoin");
  const [orders, setOrders] = useState<Order[]>([]); // State to store order history

  // Smart contract state
  const [balances, setBalances] = useState({ USD: 0, BTC: 0 });
  const [tradeStatus] = useState<string | null>(null);
  // const [sellerDeposit, setSellerDeposit] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState("");
  const [refresh, setRefresh] = useState(false);

  const handleDepositUSD = () => {
    fakeSmartContract.depositUSD("UserA", Number(depositAmount));
    setDepositAmount(""); // Reset input field

    // Add a slight delay to ensure the state updates correctly
    setTimeout(() => {
      updateBalance();
    }, 100);
  };

  useEffect(() => {
    updateBalance();
  }, []);

  const updateBalance = () => {
    setBalances(fakeSmartContract.getBalance("UserA"));
  };

  const handleResetUSD = () => {
    fakeSmartContract.resetUSDBalance("UserA");

    setTimeout(() => {
      updateBalance();
      setRefresh((prev) => !prev); // Force a component re-render
    }, 100);
  };

  // Load orders from localStorage on component mount
  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    setOrders(savedOrders);
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

  const icon_order = <i className="bx bxs-cart"></i>;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container px-4 py-4 mx-auto">
          <Header />
        </div>
      </header>
      <main className="container px-4 py-8 mx-auto">
        <div className="flex justify-end">
          <Card className="w-full max-w-md mt-8">
            <CardHeader>
              <CardTitle>Your Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <p className="bg-transparent">USD Balance: ${balances.USD}</p>
                <button className="flex items-end" onClick={handleResetUSD}>
                  Reset USD Balance
                </button>

              </div>
              <div>
                <p>BTC Balance: {balances.BTC} BTC</p>
              </div>
              <div>
                <input className="bg-transparent" placeholder="Deposit Amount" type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
                <button onClick={handleDepositUSD}>Deposit</button>
              </div>
              {tradeStatus && <p className="text-sm text-center">{tradeStatus}</p>}
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          <div className="lg:col-span-2">
            <TradingChart tradingPair={tradingPair} />
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Place Order {icon_order}</CardTitle>
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

                <Tabs
                  defaultValue="buy"
                  className="w-full"
                  onValueChange={setOrderType}
                >
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
                      <Button
                        type="submit"
                        className="w-full font-sans bg-green-500 hover:bg-green-600 text-1xl"
                      >
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
                      <Button
                        type="submit"
                        className="w-full font-sans bg-red-500 hover:bg-red-600 text-1xl"
                      >
                        Sell {baseCurrency}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            <TradeHistory></TradeHistory>
          </div>
        </div>
        
      </main>
    </div>
  );
}
