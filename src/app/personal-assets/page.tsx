"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/src/components/ui/badge";
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
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation"; // Import useRouter

// Define Asset and Transaction types
type Asset = {
  tradeid: string;
  name: string;
  symbol: string; // Add symbol to the interface
  quantity: number;
  price: number;
  totalValue: number;
  assetid: string;
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
  const [userId, setUserId] = useState<string | null>(null);
  const [listedAssetIds, setListedAssetIds] = useState<string[]>([]); // Track listed asset IDs
  const router = useRouter(); // Initialize useRouter

  // Fetch userId from localStorage (client-side only) and redirect if not logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userid");
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        router.push("/login"); // Redirect to login page if no userId
      }
    }
  }, [router]);

  // Fetch listed trades to determine which assets are being sold
  useEffect(() => {
    const fetchListedTrades = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('Trade')
          .select('assetid')
          .eq('userid', userId)
          .eq('status', 'Buy'); // Fetch trades with status 'Buy'

        if (error) throw error;

        // Extract asset IDs that are currently listed
        const assetIds = data.map((trade) => trade.assetid);
        setListedAssetIds(assetIds);
      } catch (error) {
        console.error('Error fetching listed trades:', error);
      }
    };

    fetchListedTrades();
  }, [userId]);

  // Fetch data from the API route
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const response = await fetch('/api/personal', {
          headers: {
            'user-id': userId,
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
  }, [userId]);

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
          'user-id': userId || "",
        },
        body: JSON.stringify({ amount: Number(depositAmount) }),
      });

      if (!response.ok) {
        throw new Error("Failed to update balance");
      }

      const data = await response.json();
      setBalance(data.balance);
      setDepositAmount("");
    } catch (error) {
      setError('Error updating balance');
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

  if (!userId) {
    // This should not be reached due to the redirect in useEffect, but added as a fallback
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-red-500/30 bg-[#1a2b4b]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                Authentication Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-400">Please log in to view your assets.</p>
              <Link href="/login">
                <Button className="mt-4">Go to Login</Button>
              </Link>
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
                  {balance.toFixed(2)} ETH
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
              </div>
              <table className="min-w-full bg-[#0d1829] border border-gray-700 text-center">
                <thead>
                  <tr className="bg-[#1a2b4b]">
                    <th className="py-2 px-4 border-b border-gray-700 text-white">Asset</th>
                    <th className="py-2 px-4 border-b border-gray-700 text-white">Amount</th>
                    <th className="py-2 px-4 border-b border-gray-700 text-white">Price (ETH)</th>
                    <th className="py-2 px-4 border-b border-gray-700 text-white">Total Value</th>
                    <th className="py-2 px-4 border-b border-gray-700 text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset, index) => (
                    <tr key={index} className="hover:bg-[#1a2b4b]">
                      <td className="font-medium text-white">
                        <div className="flex items-center justify-center">
                          <Badge
                            variant="outline"
                            className="mr-2 border-blue-500/30"
                          >
                            {asset.symbol.toUpperCase()}
                          </Badge>
                          {asset.name}
                        </div>
                      </td>
                      <td className="py-2 px-4 border-b border-gray-700 text-white">{asset.quantity}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-white">{asset.price.toFixed(2)}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-white">{asset.totalValue.toFixed(2)}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-white">
                        {listedAssetIds.includes(asset.assetid) ? (
                          <span className="text-yellow-400">Selling</span>
                        ) : (
                          <Link
                            href={{
                              pathname: '/markets/sell',
                              query: { name: asset.name, price: asset.price.toFixed(2) },
                            }}
                          >
                            <Button variant="outline" className="text-white">
                              Sell
                            </Button>
                          </Link>
                        )}
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