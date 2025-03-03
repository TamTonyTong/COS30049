"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/src/components/ui/input"
import { Card, CardContent } from "@/src/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { ArrowUpDown, Search, ArrowUp, ArrowDown } from "lucide-react"
import { Slider } from "@/src/components/ui/slider"

interface Crypto {
  id: number
  symbol: string
  name: string
  price: number
  change: number
  volume: string
  marketCap: string
}

export default function CryptoList() {
  const searchParams = useSearchParams()

  // Get initial values from URL parameters with null safety
  const initialSearchTerm = searchParams?.get("search") ?? ""
  const initialSortBy = searchParams?.get("sortBy") ?? "name"
  const initialSortOrder = searchParams?.get("sortOrder") ?? "asc"
  const initialMinPrice = Number(searchParams?.get("minPrice") ?? "0")
  const initialMaxPrice = Number(searchParams?.get("maxPrice") ?? "50000")

  const [cryptos, setCryptos] = useState<Crypto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [sortBy, setSortBy] = useState(initialSortBy)
  const [sortOrder, setSortOrder] = useState(initialSortOrder)
  const [priceRange, setPriceRange] = useState([initialMinPrice, initialMaxPrice])
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearchTerm)
  const [debouncedPriceRange, setDebouncedPriceRange] = useState([initialMinPrice, initialMaxPrice])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Debounce price range
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceRange(priceRange)
    }, 300)
    return () => clearTimeout(timer)
  }, [priceRange])

  // Fetch data
  useEffect(() => {
    const fetchCryptos = async () => {
      setLoading(true)
      setError(null)
      try {
        const queryParams = new URLSearchParams({
          search: debouncedSearchTerm,
          sortBy,
          sortOrder,
          minPrice: debouncedPriceRange[0].toString(),
          maxPrice: debouncedPriceRange[1].toString(),
        })

        const response = await fetch(`/api/crypto?${queryParams.toString()}`)
        if (!response.ok) {
          throw new Error("Failed to fetch data")
        }
        const data = await response.json()

        // Ensure data is an array
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received")
        }

        setCryptos(data)
      } catch (error) {
        console.error("Error fetching crypto data:", error)
        setError(error instanceof Error ? error.message : "An error occurred")
        setCryptos([]) // Reset to empty array on error
      } finally {
        setLoading(false)
      }
    }

    fetchCryptos()
  }, [debouncedSearchTerm, sortBy, sortOrder, debouncedPriceRange])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />
    return sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
  }

  // Handle error state
  if (error) {
    return (
      <Card className="bg-[#1a2b4b] border-gray-700">
        <CardContent className="p-6">
          <div className="text-center py-12 text-red-400">Error loading cryptocurrencies: {error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#1a2b4b] border-gray-700">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#243860] text-white border-gray-700"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value)
                setSortOrder("asc")
              }}
            >
              <SelectTrigger className="bg-[#243860] text-white border-gray-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="symbol">Symbol</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="change">Change</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value)}>
              <SelectTrigger className="bg-[#243860] text-white border-gray-700">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-white mb-2">
            Price Range: ${priceRange[0]} - ${priceRange[1] === 50000 ? "50,000+" : priceRange[1]}
          </h3>
          <Slider
            value={priceRange}
            min={0}
            max={50000}
            step={100}
            onValueChange={setPriceRange}
            className="[&>span:first-child]:bg-blue-500 [&>span:first-child]:h-2 [&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : Array.isArray(cryptos) && cryptos.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-[#243860]">
                  <TableHead className="text-white" onClick={() => handleSort("name")}>
                    <div className="flex items-center cursor-pointer">Name {getSortIcon("name")}</div>
                  </TableHead>
                  <TableHead className="text-white" onClick={() => handleSort("symbol")}>
                    <div className="flex items-center cursor-pointer">Symbol {getSortIcon("symbol")}</div>
                  </TableHead>
                  <TableHead className="text-white text-right" onClick={() => handleSort("price")}>
                    <div className="flex items-center justify-end cursor-pointer">Price {getSortIcon("price")}</div>
                  </TableHead>
                  <TableHead className="text-white text-right" onClick={() => handleSort("change")}>
                    <div className="flex items-center justify-end cursor-pointer">
                      24h Change {getSortIcon("change")}
                    </div>
                  </TableHead>
                  <TableHead className="text-white text-right">Volume</TableHead>
                  <TableHead className="text-white text-right">Market Cap</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cryptos.map((crypto: Crypto) => (
                  <TableRow key={crypto.id} className="border-gray-700 hover:bg-[#243860]">
                    <TableCell className="font-medium text-white">{crypto.name}</TableCell>
                    <TableCell className="text-gray-300">{crypto.symbol}</TableCell>
                    <TableCell className="text-right text-white">
                      ${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className={`text-right ${crypto.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {crypto.change >= 0 ? "+" : ""}
                      {crypto.change}%
                    </TableCell>
                    <TableCell className="text-right text-gray-300">${crypto.volume}</TableCell>
                    <TableCell className="text-right text-gray-300">${crypto.marketCap}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">No cryptocurrencies found matching your criteria.</div>
        )}
      </CardContent>
    </Card>
  )
}

