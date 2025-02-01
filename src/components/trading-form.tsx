"use client"
import { useState } from "react";
import Link from "next/link";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TradeForm = () => {
  const [orderType, setOrderType] = useState("buy");
  const [tradingPair, setTradingPair] = useState("BTC/USDT");

  return (
    <form className="space-y-4">
      {/* Trading Pair Selection */}
      <div className="space-y-2">
        <Label htmlFor="trading-pair">Trading Pair</Label>
        <Select onValueChange={setTradingPair} defaultValue="BTC/USDT">
          <SelectTrigger>
            <SelectValue placeholder="Select Pair" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
            <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
            <SelectItem value="ADA/USDT">ADA/USDT</SelectItem>
            <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Order Type Selection */}
      <RadioGroup defaultValue="buy" onValueChange={setOrderType} className="flex space-x-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="buy" id="buy" />
          <Label htmlFor="buy">Buy</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="sell" id="sell" />
          <Label htmlFor="sell">Sell</Label>
        </div>
      </RadioGroup>

      {/* Amount Input */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" type="number" placeholder="0.00" />
      </div>

      {/* Price Input */}
      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input id="price" type="number" placeholder="0.00" />
      </div>

      {/* Submit Button with Dynamic Link */}
      <Link href={`/trade/${orderType.toLowerCase()}?pair=${tradingPair}`} passHref>
        <Button className="w-full" type="submit">
          {orderType === "buy" ? "Buy" : "Sell"} {tradingPair.split("/")[0]}
        </Button>
      </Link>
    </form>
  );
};

export default TradeForm;
