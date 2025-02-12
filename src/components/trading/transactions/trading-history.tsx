import { useState, useEffect } from "react";
import { fakeSmartContract } from "./fake-smart-contract-real";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
// Define Trade Type
interface Trade {
  txHash: string;
  buyer: string;
  seller: string;
  asset: string;
  amount: number;
  price: number;
  sellerDeposit: number;
  status: string;
  timestamp: string;
}



const TradeHistory = () => {
  const [history, setHistory] = useState<Trade[]>([]);

  useEffect(() => {
    setHistory(fakeSmartContract.getTradeHistory());
  }, []);

  return (
    <Card className="relative w-full mt-6 shadow-lg">
  <CardHeader>
    <CardTitle>Trade History</CardTitle>
    {history.length > 0 && (
      <Button
        variant="destructive"
        size="sm"
        className="absolute top-3 right-3"
        onClick={() => {
          setHistory([]);
          localStorage.removeItem("fake_trades");
        }}
      >
        ✕
      </Button>
    )}
  </CardHeader>
  <CardContent>
    {history.length === 0 ? (
      <p className="text-gray-500">No trade history available.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-transparent border rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 text-center">Timestamp</th>
              <th className="px-4 py-2 text-center">Action</th>
              <th className="px-4 py-2 text-center">Tx</th>
              <th className="px-4 py-2 text-center">Asset</th>
              <th className="px-4 py-2 text-center">Amount</th>
              <th className="px-4 py-2 text-center">Price</th>
              <th className="px-4 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((trade, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2 text-center">{new Date(trade.timestamp).toLocaleString()}</td>
                <td className="px-4 py-2 text-center">
                {trade.buyer === "UserA" ? (
                    <span className={`px-2 py-1 rounded bg-green-100 text-green-800`}>
                      Buy
                    </span>
                  ) : trade.buyer === "UserB" ? (
                    <span className="px-2 py-1 text-center rounded bg-red-100 text-red-800">Sell</span>
                  ) : (
                    "Unknown"
                  )}
                </td>
                <td className="px-4 py-2 text-center">{trade.txHash}</td>
                <td className="px-4 py-2 text-center">{trade.asset}</td>
                <td className="px-4 py-2 text-center">{trade.amount}</td>
                <td className="px-4 py-2 text-center">${trade.price}</td>
                <td
                  className={`px-4 py-2 text-center font-semibold ${
                    trade.status === "Completed" ? "text-green-600" : "text-yellow-500"
                  }`}
                >
                  {trade.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </CardContent>
</Card>

  );
};

export default TradeHistory;
