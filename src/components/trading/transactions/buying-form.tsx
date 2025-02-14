"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { fakeSmartContract } from "./smart-contract-real";
import BalanceCard from "./balance-card";

function BuyingFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const price = searchParams.get("price") || "";
  const amount = searchParams.get("amount") || "";

  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [balances, setBalances] = useState({ USD: 0, BTC: 0 });
  const [tradeStatus, setTradeStatus] = useState<string | null>(null);
  const [sellerDeposit, setSellerDeposit] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState("");
  const [refresh, setRefresh] = useState(false);
  const totalCost = Number(price) * Number(amount);

  useEffect(() => {
    updateBalance();
  }, []);

  const updateBalance = () => {
    setBalances(fakeSmartContract.getBalance("UserA"));
  };

  const handleDepositUSD = () => {
    fakeSmartContract.depositUSD("UserA", Number(depositAmount));
    setDepositAmount("");
    setTimeout(() => {
      updateBalance();
    }, 100);
  };

  const handleResetUSD = () => {
    fakeSmartContract.resetUSDBalance("UserA");
    setTimeout(() => {
      updateBalance();
      setRefresh((prev) => !prev);
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
      try {
        // Deduct USD from UserA's balance
        fakeSmartContract.BuyerDepositUSD("UserA", totalCost);
      } catch (error) {
        setTradeStatus("Error: " + (error as Error).message);
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
      const updatedTrade = (await fakeSmartContract.sellerDepositBTC(trade.txHash)) as {
        txHash: string;
        sellerDeposit: number;
      };
      setSellerDeposit(updatedTrade.sellerDeposit);
      
      setTradeStatus("Seller deposited BTC. Completing trade...");

      await fakeSmartContract.completeTrade(trade.txHash);
      updateBalance();

      setTradeStatus("Trade completed! Buyer received BTC, Seller received USD.");
      console.log("Final Trade Data:", updatedTrade);
      router.push("/trade");
    }, 2000);
  };

  return (
    <div className="flex items-end justify-start">
      <BalanceCard/>
      
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
            {paymentStatus && <div className="text-sm text-center">{paymentStatus}</div>}
            <Button className="w-full bg-green-500 hover:bg-green-600" onClick={handleConfirmOrder}>
              Pay Now
            </Button>
            {tradeStatus && <p className="text-sm text-center">{tradeStatus}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function BuyingForm() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <BuyingFormContent />
    </Suspense>
  );
}
