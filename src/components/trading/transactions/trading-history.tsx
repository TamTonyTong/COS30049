import { useState, useEffect } from "react";
import { fakeSmartContract } from "./fake-smart-contract-real";

const TradeHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(fakeSmartContract.getTradeHistory());
  }, []);

  return (
    <div>
      <h2>Trade History</h2>
      <ul>
        {history.map((trade, index) => (
          <li key={index}>
            <strong>Tx:</strong> {trade.txHash} | 
            <strong>Asset:</strong> {trade.asset} | 
            <strong>Amount:</strong> {trade.amount} | 
            <strong>Price:</strong> {trade.price} | 
            <strong>Seller Deposit:</strong> {trade.sellerDeposit} BTC |
            <strong>Status:</strong> {trade.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TradeHistory;
