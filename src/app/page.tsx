'use client';

import React from 'react';

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
            <div>
              <button className="bg-green-500 text-white px-4 py-2 mx-1 rounded-md hover:bg-green-600">Deposit</button>
              <button className="bg-yellow-500 text-white px-4 py-2 mx-1 rounded-md hover:bg-yellow-600">Withdraw</button>
              <button className="bg-red-500 text-white px-4 py-2 mx-1 rounded-md hover:bg-red-600">Transfer</button>
            </div>
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
            <a href="/available-assets" className="text-blue-500 underline">View All Coins &gt;</a>
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
                    <a href={`/trade/${asset.name}`} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Trade</a>
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

// Example Data and Page Component
const HomePage: React.FC = () => {
  const exampleBalance = 2534.25;
  const exampleAssets: Asset[] = [
    { name: 'Bitcoin', amount: 2.5, price: 40000 },
    { name: 'Ethereum', amount: 10, price: 2500 },
    { name: 'Ripple', amount: 5000, price: 1 },
  ];
  const exampleTransactions: Transaction[] = [
    { id: 'qwer5678901234st', timestamp: '2025-01-31 10:00:00', type: 'Buy', amount: '1.2 BTC', status: 'Completed' },
    { id: 'uvwx4321098765yz', timestamp: '2025-01-25 14:30:00', type: 'Sell', amount: '0.5 ETH', status: 'Pending' },
    { id: 'abcd5678901234ef', timestamp: '2025-01-20 09:15:00', type: 'Transfer', amount: '3.0 LTC', status: 'Cancelled' },
    { id: 'abcd1234567890ef', timestamp: '2025-02-01 11:45:00', type: 'Deposit', amount: '2.5 BTC', status: 'Completed' },
    { id: 'ghij0987654321kl', timestamp: '2025-01-29 16:20:00', type: 'Withdraw', amount: '1.0 ETH', status: 'Pending' },
    { id: 'mnop5678901234qr', timestamp: '2025-01-27 08:05:00', type: 'Buy', amount: '4.0 LTC', status: 'Completed' },
  ];

  return (
    <div>
      <DigitalAssets
        balance={exampleBalance}
        assets={exampleAssets}
        transactions={exampleTransactions}
      />
    </div>
  );
};

export default HomePage;
