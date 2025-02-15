"use client";

import { useEffect, useState } from "react";
import Layout from "@/src/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import Link from "next/link";
import { DollarSign, Activity, Clock } from "lucide-react";
import { fakeSmartContract } from "@/src/components/trading/transactions/smart-contract-real";
import TradeHistory from "@/src/components/trading/transactions/trading-history";

// Define Asset and Transaction types
type Asset = {
  name: string;
  amount: number;
  price: number;
};

type Transaction = {
  id: string;
  timestamp: string;
  type: string;
  amount: string;
  status: string;
};

export default function HomePage() {
  const [address, setAddress] = useState<string>("0x1234567890abcdef");
  const [balances, setBalances] = useState({ USD: 0, BTC: 0 });
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(false);

  // Fetch balance from Smart Contract
  const updateBalance = () => {
    setBalances(fakeSmartContract.getBalance("UserA"));
  };

  // Handle Deposit
  const handleDepositUSD = () => {
    fakeSmartContract.depositUSD("UserA", Number(depositAmount));
    setDepositAmount("");
    setTimeout(updateBalance, 100);
  };

  // Handle Reset
  const handleResetUSD = () => {
    fakeSmartContract.resetUSDBalance("UserA");
    setTimeout(() => {
      updateBalance();
      setRefresh((prev) => !prev);
    }, 100);
  };

  // Fetch Data
  useEffect(() => {
    const userId = "personal";
    fetch(`/api/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setAssets(data.assets);
          setTransactions(data.transactions);
        }
      })
      .catch(() => setError("Error fetching data"))
      .finally(() => setLoading(false));

    updateBalance();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container px-4 py-8 mx-auto">
          <Card className="bg-[#1a2b4b] border-blue-500/30">
            <CardHeader>
              <Skeleton className="w-64 h-8 bg-gray-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-12 bg-gray-700" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container px-4 py-8 mx-auto">
          <Card className="bg-[#1a2b4b] border-red-500/30">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Error</CardTitle>
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
      <div className="container px-4 py-8 mx-auto">
        <Card className="bg-[#1a2b4b] border-blue-500/30 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-3xl font-bold text-white">
              <DollarSign className="mr-2" /> Personal Assets
            </CardTitle>
          </CardHeader>
          <CardContent>

            {/* Address */}
            <div className="mb-6">
              <h2 className="text-xl text-white">Address: {address}</h2>
            </div>

            {/* Balance */}
            <div className="mb-6">
              <h2 className="flex items-center mb-4 text-2xl font-medium text-white">
                <Activity className="mr-2" /> Balance (USD)
              </h2>
              <div className="bg-[#0d1829] p-6 rounded-lg">
                <span className="text-4xl font-bold text-green-400">${balances.USD.toLocaleString()}</span>
              </div>
            </div>

            {/* Deposit USD */}
            <div className="mb-6">
              <h2 className="text-xl font-medium text-white">Deposit USD</h2>
              <input
                className="p-2 text-white bg-transparent border border-gray-400 rounded-lg"
                placeholder="Deposit Amount"
                type="text"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <Button onClick={handleDepositUSD} className="ml-2">Deposit</Button>
            </div>

            {/* Assets Table */}
            <div className="mb-6">
              <h2 className="mb-4 text-2xl font-medium text-white">Assets</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Cryptocurrency</TableHead>
                    <TableHead className="text-right text-white">Amount</TableHead>
                    <TableHead className="text-right text-white">Price (USD)</TableHead>
                    <TableHead className="text-right text-white">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-white">{asset.name}</TableCell>
                      <TableCell className="text-right text-white">{asset.amount.toFixed(6)}</TableCell>
                      <TableCell className="text-right text-white">${asset.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Link href="/trade">
                          <Button className="text-white bg-blue-500 hover:bg-blue-600">Trade</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Transaction History */}
            <h2 className="flex items-center mb-4 text-2xl font-medium text-white">
              <Clock className="mr-2" /> Transaction History
            </h2>
            <TradeHistory />

          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
