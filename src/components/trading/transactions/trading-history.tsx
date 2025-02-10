import { useState, useEffect } from "react";
import { fakeSmartContract } from "./fake-smart-contract-real";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TradeHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(fakeSmartContract.getTradeHistory());
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6 shadow-lg relative">
      <CardHeader>
        <CardTitle>Trade History</CardTitle>
        {history.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-3 right-3"
            onClick={() => {
              setHistory([])
              localStorage.removeItem("fake_trades")
            }}
          >
            ✕
          </Button>)}
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-gray-500">No trade history available.</p>
        ) : (
          <div className="space-y-4">
            {history.map((trade, index) => (
              <div key={index} className="p-4 border rounded-lg bg-transparent">
                <p><strong>Tx:</strong> {trade.txHash}</p>
                <p><strong>Asset:</strong> {trade.asset}</p>
                <p><strong>Amount:</strong> {trade.amount}</p>
                <p><strong>Price:</strong> ${trade.price}</p>
                <p><strong>Seller Deposit:</strong> {trade.sellerDeposit || "Pending"} BTC</p>
                <p className={`font-semibold ${trade.status === "Completed" ? "text-green-600" : "text-yellow-500"}`}>
                  <strong>Status:</strong> {trade.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradeHistory;
