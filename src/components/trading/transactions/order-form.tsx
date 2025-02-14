"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useRouter } from "next/navigation";

interface OrderFormProps {
  orderType: string;
  setOrderType: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  tradingPair: string;
}

export default function OrderForm({
  orderType,
  setOrderType,
  price,
  setPrice,
  amount,
  setAmount,
  tradingPair,
}: OrderFormProps) {
  const router = useRouter();
  const baseCurrency = tradingPair.charAt(0).toUpperCase() + tradingPair.slice(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !amount) {
      alert("Please enter both price and amount.");
      return;
    }
    router.push(`/trade/${orderType}?pair=${tradingPair}&price=${price}&amount=${amount}`);
  };

  return (
    <Tabs defaultValue="buy" className="w-full" onValueChange={setOrderType}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="buy">Buy</TabsTrigger>
        <TabsTrigger value="sell">Sell</TabsTrigger>
      </TabsList>
      <TabsContent value="buy">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Label htmlFor="buy-price">Price</Label>
          <Input
            id="buy-price"
            type="text"
            inputMode="numeric"
            placeholder="0.00"
            value={price}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d*$/.test(value)) {
                setPrice(value);
              }
            }}
            required
          />
          <Label htmlFor="buy-amount">Amount</Label>
          <Input
            id="buy-amount"
            type="text"
            inputMode="numeric"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d*$/.test(value)) {
                setAmount(value);
              }
            }}
            required
          />
          <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">
            Buy {baseCurrency}
          </Button>
        </form>
      </TabsContent>
      <TabsContent value="sell">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Label htmlFor="sell-price">Price</Label>
          <Input
            id="sell-price"
            type="text"
            inputMode="numeric"
            placeholder="0.00"
            value={price}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d*$/.test(value)) {
                setPrice(value);
              }
            }}
            required
          />
          <Label htmlFor="sell-amount">Amount</Label>
          <Input
            id="sell-amount"
            type="text"
            inputMode="numeric"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d*$/.test(value)) {
                setAmount(value);
              }
            }}
            required
          />
          <Button type="submit" className="w-full bg-red-500 hover:bg-red-600">
            Sell {baseCurrency}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
