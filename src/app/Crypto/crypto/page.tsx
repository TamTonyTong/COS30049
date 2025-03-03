"use client";


import CryptoList from "@/src/app/Crypto/crypto/crypto-list";
import Layout from "@/src/components/layout"


export default function CryptoMarketPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Cryptocurrency Market</h1>
        <p className="text-gray-400 mb-8">
          Explore the latest cryptocurrency prices, market caps, and trading volumes. Use the search and filter options
          to find specific cryptocurrencies.
        </p>
        <CryptoList />
      </div>
    </Layout>
  )
}

