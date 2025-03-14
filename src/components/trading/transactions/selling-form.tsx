import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { fakeSmartContract } from "@/src/components/trading/transactions/smart-contract-real";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SellingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const price = searchParams?.get("price") || "";
  const amount = searchParams?.get("amount") || "";
  const totalCost = Number(price) * Number(amount);

  const [balances, setBalances] = useState({ USD: 0, BTC: 0 });
  const [tradeStatus, setTradeStatus] = useState<string | null>(null);

  useEffect(() => {
    updateBalance();
  }, []);

  const updateBalance = () => {
    setBalances(fakeSmartContract.getBalance("UserA")); // Seller is UserB
  };

  const handleConfirmOrder = async () => {
    if (!price || !amount) {
      alert("Please enter both price and amount.");
      return;
    }

    // Check if the seller has enough BTC to sell
    if (balances.BTC < Number(amount)) {
      setTradeStatus("Insufficient BTC balance.");
      return;
    }

    setTradeStatus("Initiating trade...");

    // Initiate the trade
    const trade = fakeSmartContract.initiateTrade(
      "UserB",
      "UserA",
      "BTC",
      Number(amount),
      Number(price),
    );

    if ("error" in trade) {
      setTradeStatus(`Trade failed: ${trade.error}`);
      return;
    }

    setTradeStatus("Waiting for buyer to deposit USD...");

    // Simulate buyer depositing USD
    setTimeout(async () => {
      fakeSmartContract.BuyerDepositUSD("UserB", totalCost);
      setTradeStatus("Buyer deposited USD. Depositing BTC...");

      // Seller deposits BTC
      (await fakeSmartContract.sellerDepositBTC(trade.txHash)) as {
        txHash: string;
        sellerDeposit: number;
      };

      setTradeStatus("BTC deposited. Completing trade...");

      // Complete the trade
      await fakeSmartContract.completeTrade(trade.txHash);
      updateBalance();

      setTradeStatus(
        "Trade completed! Seller received USD, Buyer received BTC.",
      );
      router.push("/trade");
    }, 3000);
  };
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Confirm Sell Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="sell-price">Price</Label>
          <Input id="sell-price" type="number" value={price} disabled />
        </div>
        <div>
          <Label htmlFor="sell-amount">Amount</Label>
          <Input id="sell-amount" type="number" value={amount} disabled />
        </div>
        <div>
          <p>USD Balance: ${balances.USD}</p>
          <p>BTC Balance: {balances.BTC} BTC</p>
        </div>
        {tradeStatus && <p className="text-center text-sm">{tradeStatus}</p>}
        <Button
          className="w-full bg-red-500 hover:bg-red-600"
          onClick={handleConfirmOrder}
        >
          Confirm Sell Order
        </Button>
      </CardContent>
    </Card>
  );
}
