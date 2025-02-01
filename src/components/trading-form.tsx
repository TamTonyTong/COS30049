import { useState } from "react";

const TradingForm = ({ tradingPair }) => {
  const [orderType, setOrderType] = useState("buy");

  return (
    <form className="space-y-4">
      <h2 className="text-lg font-semibold">Trade {tradingPair}</h2>

      <div className="flex space-x-4">
        <button type="button" onClick={() => setOrderType("buy")} className={`p-2 rounded ${orderType === "buy" ? "bg-green-500 text-white" : "bg-gray-200"}`}>
          Buy
        </button>
        <button type="button" onClick={() => setOrderType("sell")} className={`p-2 rounded ${orderType === "sell" ? "bg-red-500 text-white" : "bg-gray-200"}`}>
          Sell
        </button>
      </div>

      <div className="space-y-2">
        <label htmlFor="amount">Amount</label>
        <input id="amount" type="number" placeholder="0.00" className="w-full p-2 border rounded-md" />
      </div>

      <button className="w-full p-2 bg-blue-500 text-white rounded-md">
        {orderType === "buy" ? "Buy" : "Sell"} {tradingPair}
      </button>
    </form>
  );
};

export default TradingForm;
