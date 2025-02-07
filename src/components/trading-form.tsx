"use client"
import { useState } from "react";
import { fakeSmartContract } from "@/components/fake-smart-contract"; // Import the fake contract

const TradingForm = () => {
  const [asset, setAsset] = useState("");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [tradeResult, setTradeResult] = useState(null);

  const handleTrade = () => {
    const trade = fakeSmartContract.executeTrade(
      "UserA",
      "UserB",
      asset,
      Number(amount),
      Number(price)
    );
    setTradeResult(trade);
  };

  return (
    <div>
      <h2>Trade Assets</h2>
      <div>
      <input placeholder="Asset" value={asset} onChange={(e) => setAsset(e.target.value)}  className="bg-transparent"/>
      <input placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)}  className="bg-transparent"/>
      <input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)}  className="bg-transparent"/>
      </div>
      <button onClick={handleTrade}>Execute Trade</button>

      {tradeResult && (
        <div>
          <p>Trade Executed!</p>
          <p>Tx Hash: {tradeResult.txHash}</p>
          <p>Asset: {tradeResult.asset}</p>
          <p>Amount: {tradeResult.amount}</p>
          <p>Price: {tradeResult.price}</p>
        </div>
      )}
    </div>
  );
};

export default TradingForm;
