'use client';

// pages/index.js
import Head from 'next/head';
import React, { useState } from 'react';

// Sample digital assets data with market data
const digitalAssets = [
  { id: 1, name: 'Bitcoin', symbol: 'BTC', price: '1 USD = 0.00000978 BTC', amount: '19.82M' },
  { id: 2, name: 'Ethereum', symbol: 'ETH', price: '1 USD = 0.000322 ETH', amount: '120.52M' },
  { id: 3, name: 'Ripple', symbol: 'XRP', price: '1 USD = 0.329 XRP', amount: '57.70B' },
  { id: 4, name: 'Litecoin', symbol: 'LTC', price: '1 USD = 0.0071 LTC', amount: '84M' },
  { id: 5, name: 'Cardano', symbol: 'ADA', price: '1 USD = 1.57 ADA', amount: '32B' },
  { id: 6, name: 'Polkadot', symbol: 'DOT', price: '1 USD = 0.04 DOT', amount: '1.1B' },
  { id: 7, name: 'Stellar', symbol: 'XLM', price: '1 USD = 5.93 XLM', amount: '50B' },
  { id: 8, name: 'Chainlink', symbol: 'LINK', price: '1 USD = 0.065 LINK', amount: '1B' },
];

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = digitalAssets.filter((asset) =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-700">
      <Head>
        <title>Digital Assets</title>
        <meta name="description" content="A list of digital assets with market data, using Tailwind CSS and Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-8">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4">Markets</h1>
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-2 mb-4 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ul className="space-y-4">
            {filteredAssets.map((asset) => (
              <li key={asset.id} className="p-6 border rounded-md shadow-sm relative group">
                <div className="text-xl font-semibold cursor-pointer">
                  {asset.name} ({asset.symbol})
                    <div className="hidden group-hover:block transition-all duration-300 ease-in-out mt-2">
                        <div className="text-2xl font-bold text-center bg-white border border-gray-300 rounded-md shadow-lg p-4">
                            {asset.price}
                        <div className="text-gray-700 mt-2">Current Amount: {asset.amount}</div>
                        </div>
                    </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Home;
