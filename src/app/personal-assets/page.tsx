"use client";

import { useEffect, useState } from "react";
import Layout from "@/src/components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import Link from "next/link";
import { DollarSign, Activity } from "lucide-react";

// Define Asset and Transaction types
type Asset = {
  name: string;
  quantity: number;
  price: number;
  totalValue: number;
};

type Transaction = {
  id: string;
  timestamp: string;
  type: string;
  amount: string;
  status: string;
};

export default function HomePage() {
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // Store userId in state

  // Fetch userId from localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("userid");
      setUserId(userId);
    }
  }, []);

  // Fetch data from the API route
  useEffect(() => {
    if (!userId) return; // Don't fetch data if userId is not available

    const fetchData = async () => {
      try {
        const response = await fetch('/api/personal', {
          headers: {
            'user-id': userId, // Pass userId in the headers
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();

        // Map the fetched data to your state
        setAddress(data.publicaddress);
        setBalance(data.balance);
        setAssets(data.assets);
        setTransactions(
          data.transactions.map((tx: any) => ({
            id: tx.txid,
            timestamp: new Date(tx.creationtimestamp).toLocaleString(),
            type: tx.type,
            amount: tx.amount,
            status: tx.status,
          }))
        );
      } catch (error) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]); // Re-fetch data when userId changes

  // Handle Deposit
  const handleDepositUSD = async () => {
    if (!depositAmount || isNaN(Number(depositAmount))) {
      setError('Invalid deposit amount');
      return;
    }

    try {
      const response = await fetch('/api/personal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId || "", // Pass userId in the headers
        },
        body: JSON.stringify({ amount: Number(depositAmount) }),
      });

      if (!response.ok) {
        throw new Error("Failed to update balance");
      }

      const data = await response.json();
      setBalance(data.balance); // Update the balance in the state
      setDepositAmount(""); // Clear the deposit input
    } catch (error) {
      setError('Error updating balance');
    }
  };

  // Handle Sell
  const handleSell = async (assetName: string) => {
    try {
      const response = await fetch('/api/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId || "", // Pass userId in the headers
        },
        body: JSON.stringify({ assetName }),
      });

      if (!response.ok) {
        throw new Error("Failed to sell asset");
      }

      const data = await response.json();
      setBalance(data.balance); // Update the balance in the state
      setAssets(data.assets); // Update the assets in the state
    } catch (error) {
      setError('Error selling asset');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-blue-500/30 bg-[#1a2b4b]">
            <CardHeader>
              <Skeleton className="h-8 w-64 bg-gray-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-full bg-gray-700" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-red-500/30 bg-[#1a2b4b]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 border-blue-500/30 bg-[#1a2b4b]">
          <CardHeader>
            <CardTitle className="flex items-center text-3xl font-bold text-white">
              <DollarSign className="mr-2" /> Personal Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Address */}
            <div className="mb-6">
              <h2 className="text-xl text-white">UserID: {userId}</h2>
            </div>

            {/* Balance */}
            <div className="mb-6">
              <h2 className="mb-4 flex items-center text-2xl font-medium text-white">
                <Activity className="mr-2" /> Balance (ETH)
              </h2>
              <div className="rounded-lg bg-[#0d1829] p-6">
                <span className="text-4xl font-bold text-green-400">
                  {balance.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Deposit USD */}
            <div className="mb-6">
              <h2 className="text-xl font-medium text-white">Deposit USD</h2>
              <input
                className="rounded-lg border border-gray-400 bg-transparent p-2 text-white"
                placeholder="Deposit Amount"
                type="text"
                value={depositAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value)) {
                    setDepositAmount(value);
                  }
                }}
              />
              <Button onClick={handleDepositUSD} className="ml-2">
                Deposit
              </Button>
            </div>

            {/* User Assets */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-white">Assets</h2>
                <Link href="/trade"> {/* Link to the trading page */}
                  <Button variant="outline" className="text-white">
                    Trade
                  </Button>
                </Link>
              </div>
              <table className="min-w-full bg-[#0d1829] border border-gray-700 text-center">
                <thead>
                  <tr className="bg-[#1a2b4b]">
                    <th className="py-2 px-4 border-b border-gray-700 text-white">Cryptocurrency</th>
                    <th className="py-2 px-4 border-b border-gray-700 text-white">Amount</th>
                    <th className="py-2 px-4 border-b border-gray-700 text-white">Price (ETH)</th>
                    <th className="py-2 px-4 border-b border-gray-700 text-white">Total Value</th>
                    <th className="py-2 px-4 border-b border-gray-700 text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset, index) => (
                    <tr key={index} className="hover:bg-[#1a2b4b]">
                      <td className="py-2 px-4 border-b border-gray-700 text-white">{asset.name}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-white">{asset.quantity}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-white">{asset.price.toFixed(2)}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-white">{asset.totalValue.toFixed(2)}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-white">
                        <Button variant="outline" className="text-white" onClick={() => handleSell(asset.name)}>
                          Sell
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Transaction History */}
            <div className="mb-6">
              <h2 className="text-xl font-medium text-white mb-3">Transaction History</h2>
              <table className="min-w-full bg-[#0d1829] border border-gray-700 text-center">
                <thead>
                  <tr className="bg-[#1a2b4b]">
                    <th className="py-2 px-4 border-b border-gray-700 text-white">Transaction ID</th>
                    <th className="py-2 px-4 border-b border-gray-700 text-white">Timestamp</th>
                    <th className="py-2 px-4 border-b border-gray-700 text-white">Type</th>
                    <th className="py-2 px-4 border-b border-gray-700 text-white">Amount</th>
                    <th className="py-2 px-4 border-b border-gray-700 text-white">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#1a2b4b]">
                      <td className="py-2 px-4 border-b border-gray-700 text-white">{tx.id}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-white">{tx.timestamp}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-white">{tx.type}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-white">{tx.amount}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-white">{tx.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}