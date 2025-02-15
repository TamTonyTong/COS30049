'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import Layout from "../../components/layout"

// Define the types for the props
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

type DigitalAssetsProps = {
  address: string;
  balance: number;
  assets: Asset[];
  transactions: Transaction[];
};

// DigitalAssets Component
const DigitalAssets: React.FC<DigitalAssetsProps> = ({ address, balance, assets, transactions }) => {
  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto">
        <Card className="bg-[#1a2b4b] border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Personal Asset</CardTitle>
          </CardHeader>
          <CardContent>
            {/* User Address */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="left-3 text-xl text-white">Address: {address}</h2>
              </div>
            </div>

            {/* User Balance */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="left-3 text-xl font-medium text-white">Balance (USD)</h2>
              </div>
              <table className="min-w-full bg-[#1a2b4b] border border-gray-700 text-center">
                <thead>
                  <tr className="bg-[#0d1829]">
                    <th className="py-2 px-4 border-b text-white">Balance (USD)</th>
                  </tr>
                </thead>
                <tbody className="bg-[#06203E]">
                  <tr className="hover:bg-[#0d1829]">
                    <td className="py-2 px-4 border-b text-white">{balance} USD</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* User Assets */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-white">Assets</h2>
              </div>
              <table className="min-w-full bg-[#0d1829] border border-gray-700 text-center">
                <thead>
                  <tr className="bg-[#0d1829] text-white">
                    <th className="py-2 px-4 border-b">Cryptocurrency</th>
                    <th className="py-2 px-4 border-b">Amount</th>
                    <th className="py-2 px-4 border-b">Price (USD)</th>
                    <th className="py-2 px-4 border-b">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-[#06203E]">
                  {assets.map((asset, index) => (
                    <tr key={index} className="hover:bg-[#0d1829] text-white">
                      <td className="py-2 px-4 border-b">{asset.name}</td>
                      <td className="py-2 px-4 border-b">{asset.amount}</td>
                      <td className="py-2 px-4 border-b">{asset.price}</td>
                      <td className="py-2 px-4 border-b">
                        <a href={`/trade`} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Trade</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Transactions History */}
            <div className="mb-6">
              <h2 className="text-xl font-medium text-white mb-3">Transaction History</h2>
              <table className="min-w-full bg-[#1a2b4b] border border-gray-700 text-center">
                <thead>
                  <tr className="bg-[#0d1829] text-white">
                    <th className="py-2 px-4 border-b">Transaction ID</th>
                    <th className="py-2 px-4 border-b">Timestamp</th>
                    <th className="py-2 px-4 border-b">Type</th>
                    <th className="py-2 px-4 border-b">Amount</th>
                    <th className="py-2 px-4 border-b">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-[#06203E]">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#0d1829] text-white">
                      <td className="py-2 px-4 border-b">{tx.id}</td>
                      <td className="py-2 px-4 border-b">{tx.timestamp}</td>
                      <td className="py-2 px-4 border-b">{tx.type}</td>
                      <td className="py-2 px-4 border-b">{tx.amount}</td>
                      <td className="py-2 px-4 border-b">{tx.status}</td>
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
};

// HomePage Component
const HomePage: React.FC = () => {
  const [address, setAddress] = useState<string>('0x1234567890abcdef');
  const [balance, setBalance] = useState<number>(0);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //fetch data from the fake API
  useEffect(() => {
    const userId = 'personal';
    fetch(`/api/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setAddress(data.address);
          setBalance(data.balance);
          setAssets(data.assets);
          setTransactions(data.transactions);
        }
      })
      .catch((err) => setError('Error fetching data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <DigitalAssets address={address} balance={balance} assets={assets} transactions={transactions} />
    </div>
  );
};

export default HomePage;