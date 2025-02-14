'use client';

import React, { useEffect, useState } from 'react';

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
  balance: number;
  assets: Asset[];
  transactions: Transaction[];
};

// DigitalAssets Component
const DigitalAssets: React.FC<DigitalAssetsProps> = ({ balance, assets, transactions }) => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-5 text-gray-700">
      <div className="container mx-auto bg-white shadow-md rounded-md p-5">
        <h1 className="text-2xl font-semibold mb-4">Personal Digital Assets</h1>

        {/* User Balance */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Balance (USD)</h2>
          </div>
          <table className="min-w-full bg-white border border-gray-200 text-center">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Balance (USD)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b">{balance} USD</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* User Assets */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Assets</h2>
          </div>
          <table className="min-w-full bg-white border border-gray-200 text-center">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Cryptocurrency</th>
                <th className="py-2 px-4 border-b">Amount</th>
                <th className="py-2 px-4 border-b">Price (USD)</th>
                <th className="py-2 px-4 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => (
                <tr key={index} className="hover:bg-gray-100">
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
          <h2 className="text-xl font-medium mb-3">Transaction History</h2>
          <table className="min-w-full bg-white border border-gray-200 text-center">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Transaction ID</th>
                <th className="py-2 px-4 border-b">Timestamp</th>
                <th className="py-2 px-4 border-b">Type</th>
                <th className="py-2 px-4 border-b">Amount</th>
                <th className="py-2 px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-100">
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
      </div>
    </div>
  );
};

// HomePage Component
const HomePage: React.FC = () => {
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
      <DigitalAssets balance={balance} assets={assets} transactions={transactions} />
    </div>
  );
};

export default HomePage;