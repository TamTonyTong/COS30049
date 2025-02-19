"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { fakeSmartContract } from "@/src/components/trading/transactions/smart-contract-real";

export default function BalanceCard() {
  const [balances, setBalances] = useState({ USD: 0, BTC: 0 });
  const [depositAmount, setDepositAmount] = useState("");
  const [refresh, setRefresh] = useState(false);

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
      setRefresh((prev) => !prev); // Force a component re-render
    }, 100);
  };

  useEffect(() => {
    updateBalance();
  }, []);

  return (
    <Card className="mt-2 w-full max-w-md lg:col-start-2">
      <CardHeader>
        <CardTitle>Your Balance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <p className="bg-transparent">USD Balance: ${balances.USD}</p>
          {/* <button className="flex items-end" onClick={handleResetUSD}>
            Reset USD Balance
          </button> */}
        </div>
        <div>
          <p>BTC Balance: {balances.BTC} BTC</p>
        </div>
        {/* <div>
          <input
            className="bg-transparent"
            placeholder="Deposit Amount"
            type="text"
            inputMode="numeric"
            value={depositAmount}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d*$/.test(value)) {
                setDepositAmount(value);
              }
            }}
          />
          <button onClick={handleDepositUSD}>Deposit</button>
        </div> */}
      </CardContent>
    </Card>
  );
}
