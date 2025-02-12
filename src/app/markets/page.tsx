"use client"

import { useState, useEffect } from "react"
import { Input } from "@/src/components/ui/input"

// Sample digital assets data with market data
const digitalAssets = [
  { id: 1, name: "Bitcoin", symbol: "BTC", price: "1 USD = 0.00000978 BTC", amount: "19.82M" },
  { id: 2, name: "Ethereum", symbol: "ETH", price: "1 USD = 0.000322 ETH", amount: "120.52M" },
  { id: 3, name: "Ripple", symbol: "XRP", price: "1 USD = 0.329 XRP", amount: "57.70B" },
  { id: 4, name: "Litecoin", symbol: "LTC", price: "1 USD = 0.0071 LTC", amount: "84M" },
  { id: 5, name: "Cardano", symbol: "ADA", price: "1 USD = 1.57 ADA", amount: "32B" },
  { id: 6, name: "Polkadot", symbol: "DOT", price: "1 USD = 0.04 DOT", amount: "1.1B" },
  { id: 7, name: "Stellar", symbol: "XLM", price: "1 USD = 5.93 XLM", amount: "50B" },
  { id: 8, name: "Chainlink", symbol: "LINK", price: "1 USD = 0.065 LINK", amount: "1B" },
]

export default function MarketsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const filteredAssets = digitalAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return null // This will show the loading.tsx content
  }

  return (
    <>
      <Input
        type="text"
        placeholder="Search..."
        className="w-full p-2 mb-4 bg-[#1a2b4b] border-gray-700 text-white"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul className="space-y-4">
        {filteredAssets.map((asset) => (
          <li key={asset.id} className="relative p-6 border border-gray-700 rounded-md shadow-sm bg-[#1a2b4b] group">
            <div className="text-xl font-semibold cursor-pointer">
              {asset.name} ({asset.symbol})
              <div className="hidden mt-2 transition-all duration-300 ease-in-out group-hover:block">
                <div className="p-4 text-2xl font-bold text-center bg-[#0d1829] border border-gray-700 rounded-md shadow-lg">
                  {asset.price}
                  <div className="mt-2 text-gray-400">Current Amount: {asset.amount}</div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

