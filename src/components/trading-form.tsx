"use client"

import { useState } from "react";
import { fakeSmartContract } from "@/components/fake-smart-contract";

const TradingForm = () => {
  const [asset, setAsset] = useState("");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [tradeResult, setTradeResult] = useState(null);
  const [status, setStatus] = useState("");

  const handleDepositUSD = () => {
    fakeSmartContract.depositUSD("UserA", Number(depositAmount));
    alert(`Deposited $${depositAmount} to UserA's balance.`);
  };

  const handleTrade = async () => {
    setStatus("Initiating trade...");
    const trade = fakeSmartContract.initiateTrade("UserA", "UserB", asset, Number(amount), Number(price));

    if (trade.error) {
      alert(trade.error);
      return;
    }

    setTradeResult(trade);
    setStatus("Waiting for seller to deposit SCM...");

    await fakeSmartContract.sellerDepositSCM(trade.txHash);
    setStatus("Seller deposited SCM. Completing trade...");

    await fakeSmartContract.completeTrade(trade.txHash);
    setStatus("Trade completed! Buyer received SCM, Seller received USD.");
  };

  return (
    <div>
      <h2>Deposit USD</h2>
      <input placeholder="Deposit Amount" type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="bg-transparent"/>
      <button onClick={handleDepositUSD}>Deposit</button>

      <h2>Trade Assets</h2>
      <select value={asset} onChange={(e) => setAsset(e.target.value)} className="bg-transparent" >
      <option label="SCM" value={"SCM"}  className="bg-transparent"></option>
      </select>
      <input placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-transparent" />
      <input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-transparent" />
      <button onClick={handleTrade}>Execute Trade</button>

      {status && <p>Status: {status}</p>}
    </div>
  );
};

export default TradingForm;
