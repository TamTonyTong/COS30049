"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { fakeSmartContract } from "./fake-smart-contract-real";

export default function BuyingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const price = searchParams.get("price") || "";
  const amount = searchParams.get("amount") || "";

  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  // Smart contract state
  const [balances, setBalances] = useState({ USD: 0, BTC: 0 });
  const [tradeStatus, setTradeStatus] = useState<string | null>(null);
  const [sellerDeposit, setSellerDeposit] = useState<number>(0);
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

  const handleConfirmOrder = async () => {


    setPaymentStatus("Processing payment...");
    setTimeout(async () => {
      const isPaymentSuccessful = true;
      if (!isPaymentSuccessful) {
        setPaymentStatus("Payment failed. Please try again.");
        return;
      }

      setPaymentStatus("Payment successful! Executing trade...");
      setTradeStatus("Initiating trade...");

      const trade = fakeSmartContract.initiateTrade("UserA", "UserB", "BTC", Number(amount), Number(price));

      if ("error" in trade) {
        setTradeStatus(`Trade failed: ${trade.error}`);
        return;
      }

      setTradeStatus("Waiting for seller to deposit BTC...");

      const updatedTrade = await (fakeSmartContract.sellerDepositBTC(trade.txHash)) as {
        txHash: string;
        sellerDeposit: number;
      };
      setSellerDeposit(updatedTrade.sellerDeposit);
      setTradeStatus("Seller deposited BTC. Completing trade...");

      await fakeSmartContract.completeTrade(trade.txHash);
      updateBalance();

      setTradeStatus("Trade completed! Buyer received BTC, Seller received USD.");
      // Debugging: Log the final trade details
      console.log("Final Trade Data:", updatedTrade);
      router.push("/trade");
    }, 2000);
  };
  console.log(balances.BTC)
  return (
    <div className="flex justify-start items-end">
      <Card className="w-full max-w-md items-start mt-8">
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

      <div className="flex mt-8 ml-32">
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
            {paymentStatus && <div className="text-center text-sm">{paymentStatus}</div>}
            <Button className="w-full bg-green-500 hover:bg-green-600" onClick={handleConfirmOrder}>
              Pay Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
