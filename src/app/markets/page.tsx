"use client"

import { useState, useEffect } from "react"
import { Input } from "@/src/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Badge } from "@/src/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, Search } from "lucide-react"
import Layout from "../../components/layout"

// Sample digital assets data with market data
const digitalAssets = [
  { id: 1, name: "Bitcoin", symbol: "BTC", price: 50000, change: 2.5, volume: "10.5B", marketCap: "950B" },
  { id: 2, name: "Ethereum", symbol: "ETH", price: 3500, change: -1.2, volume: "8.2B", marketCap: "420B" },
  { id: 3, name: "Ripple", symbol: "XRP", price: 1.2, change: 0.8, volume: "3.1B", marketCap: "57B" },
  { id: 4, name: "Litecoin", symbol: "LTC", price: 180, change: -0.5, volume: "1.8B", marketCap: "12B" },
  { id: 5, name: "Cardano", symbol: "ADA", price: 2.1, change: 3.2, volume: "2.5B", marketCap: "68B" },
  { id: 6, name: "Polkadot", symbol: "DOT", price: 35, change: 1.7, volume: "1.2B", marketCap: "35B" },
  { id: 7, name: "Stellar", symbol: "XLM", price: 0.4, change: -0.3, volume: "0.8B", marketCap: "9B" },
  { id: 8, name: "Chainlink", symbol: "LINK", price: 28, change: 4.1, volume: "1.5B", marketCap: "13B" },
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
    <Layout>
      <div className="container px-4 py-8 mx-auto">
        <Card className="bg-[#1a2b4b] border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Digital Asset Markets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-6">
              <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <Input
                type="text"
                placeholder="Search by name or symbol..."
                className="w-full pl-10 pr-4 py-2 bg-[#0d1829] border-gray-700 text-white rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Asset</TableHead>
                    <TableHead className="text-right text-white">Price (USD)</TableHead>
                    <TableHead className="text-right text-white">24h Change</TableHead>
                    <TableHead className="text-right text-white">24h Volume</TableHead>
                    <TableHead className="text-right text-white">Market Cap</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => (
                    <TableRow key={asset.id} className="hover:bg-[#0d1829] transition-colors">
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {asset.symbol}
                          </Badge>
                          {asset.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-white">${asset.price.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`flex items-center justify-end ${
                            asset.change >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {asset.change >= 0 ? (
                            <ArrowUpRight className="mr-1" size={16} />
                          ) : (
                            <ArrowDownRight className="mr-1" size={16} />
                          )}
                          {Math.abs(asset.change)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-gray-300">{asset.volume}</TableCell>
                      <TableCell className="text-right text-gray-300">{asset.marketCap}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

