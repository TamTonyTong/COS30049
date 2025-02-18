"use client";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

interface TradingPairSelectorProps {
  tradingPair: string;
  setTradingPair: (value: string) => void;
}

export default function TradingPairSelector({
  tradingPair,
  setTradingPair,
}: TradingPairSelectorProps) {
  return (
    <div className="mb-4">
      <Label>Trading Pair</Label>
      <Select value={tradingPair} onValueChange={setTradingPair}>
        <SelectTrigger>
          <SelectValue placeholder="Select Pair" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="bitcoin">BTC/USD</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
