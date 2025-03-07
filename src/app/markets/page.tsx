
"use client"

// src/app/markets/page.tsx
import dynamic from "next/dynamic";


import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Slider } from "@/src/components/ui/slider"
import { ArrowUpRight, ArrowDownRight, Search, ArrowUp, ArrowDown, X, SlidersHorizontal } from "lucide-react"
import Layout from "@/src/components/layout"

interface Asset {
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  total_volume: number
  market_cap: number
  assettype?: string
  decimals?: number
}

type SortField = "name" | "current_price" | "price_change_percentage_24h" | "total_volume" | "market_cap"
type SortOrder = "asc" | "desc"
type PriceRange = [number, number]
type AssetType = "all" | "cryptocurrency" | "stock" | "forex" | "commodity"

export default function MarketsPage() {
  const searchParams = useSearchParams()

  // Get initial values from URL parameters
const initialSearchTerm = searchParams?.get("search") || "";
const initialSortField = (searchParams?.get("sortBy") as SortField) || "market_cap";
const initialSortOrder = (searchParams?.get("sortOrder") as SortOrder) || "desc";
const initialMinPrice = Number(searchParams?.get("minPrice") || "0");
const initialMaxPrice = Number(searchParams?.get("maxPrice") || "1000000");
const initialAssetType = (searchParams?.get("assetType") as AssetType) || "all";

  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>(initialSearchTerm)
  const [sortField, setSortField] = useState<SortField>(initialSortField)
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder)
  const [priceRange, setPriceRange] = useState<PriceRange>([initialMinPrice, initialMaxPrice])
  const [debouncedPriceRange, setDebouncedPriceRange] = useState<PriceRange>([initialMinPrice, initialMaxPrice])
  const [assetType, setAssetType] = useState<AssetType>(initialAssetType)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Maximum price for UI purposes - dynamically set based on highest price
  const [maxPriceValue, setMaxPriceValue] = useState(100000)

  // Fetch data
  useEffect(() => {
    setIsLoading(true)
    fetch("/api/assets")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.json()
      })
      .then((data) => {
        if (data.assets && Array.isArray(data.assets)) {
          setAssets(data.assets)

          // Find the highest price for the slider max value
          const highestPrice = Math.max(...data.assets.map((asset: Asset) => asset.current_price))
          // Round up to the nearest power of 10 for a clean max value
          const roundedMax = Math.pow(10, Math.ceil(Math.log10(highestPrice)))
          setMaxPriceValue(roundedMax)

          // If the initial max price was the default, update it to the new max
          if (initialMaxPrice === 1000000) {
            setPriceRange([initialMinPrice, roundedMax])
            setDebouncedPriceRange([initialMinPrice, roundedMax])
          }
        } else {
          setAssets([])
        }
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching data:", error)
        setError("Error fetching data")
        setIsLoading(false)
      })
  }, [initialMinPrice, initialMaxPrice])

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

  // Update active filters
  useEffect(() => {
    const newActiveFilters: string[] = []

    if (sortField !== "market_cap" || sortOrder !== "desc") {
      newActiveFilters.push(getSortLabel(sortField, sortOrder))
    }

    if (debouncedPriceRange[0] > 0 || debouncedPriceRange[1] < maxPriceValue) {
      newActiveFilters.push(
        `Price: $${formatNumber(debouncedPriceRange[0])} - $${debouncedPriceRange[1] === maxPriceValue ? "Max" : formatNumber(debouncedPriceRange[1])}`,
      )
    }

    if (assetType !== "all") {
      newActiveFilters.push(`Type: ${getAssetTypeLabel(assetType)}`)
    }

    setActiveFilters(newActiveFilters)
  }, [sortField, sortOrder, debouncedPriceRange, assetType, maxPriceValue])

  // Filter and sort assets
  const filteredAndSortedAssets = useMemo(() => {
    // First filter by search term, price range, and asset type
    const filtered = assets.filter(
      (asset) =>
        (asset.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          asset.symbol.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) &&
        asset.current_price >= debouncedPriceRange[0] &&
        asset.current_price <= debouncedPriceRange[1] &&
        (assetType === "all" || asset.assettype === assetType),
    )

    // Then sort
    return [...filtered].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      // Special case for strings
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      // For numbers
      return sortOrder === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
    })
  }, [assets, debouncedSearchTerm, debouncedPriceRange, assetType, sortField, sortOrder])

  // Helper function to format numbers with commas
  function formatNumber(num: number): string {
    return num.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })
  }

  // Helper function to get asset type label
  function getAssetTypeLabel(type: AssetType): string {
    const labels: Record<AssetType, string> = {
      all: "All Types",
      cryptocurrency: "Cryptocurrency",
      stock: "Stock",
      forex: "Forex",
      commodity: "Commodity",
    }
    return labels[type]
  }

  // Helper function to get sort label
  function getSortLabel(field: SortField, order: SortOrder): string {
    const fieldLabels: Record<SortField, string> = {
      name: "Name",
      current_price: "Price",
      price_change_percentage_24h: "Change",
      total_volume: "Volume",
      market_cap: "Market Cap",
    }

    return `${fieldLabels[field]} (${order === "asc" ? "Low to High" : "High to Low"})`
  }

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc") // Default to descending when changing fields
    }
  }

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortOrder === "asc" ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
  }

  // Clear a specific filter
  const clearFilter = (filter: string) => {
    if (filter.startsWith("Price:")) {
      setPriceRange([0, maxPriceValue])
    } else if (filter.startsWith("Type:")) {
      setAssetType("all")
    } else {
      // It's a sort filter
      setSortField("market_cap")
      setSortOrder("desc")
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setPriceRange([0, maxPriceValue])
    setSortField("market_cap")
    setSortOrder("desc")
    setAssetType("all")
    setSearchTerm("")
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container px-4 py-8 mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="container px-4 py-8 mx-auto">
          <Card className="border-red-500/30 bg-[#1a2b4b]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  if (assets.length === 0) {
    return (
      <Layout>
        <div className="container px-4 py-8 mx-auto">
          <Card className="border-blue-500/30 bg-[#1a2b4b]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">No Assets Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">No assets are available.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto">
        <Card className="border-blue-500/30 bg-[#1a2b4b]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold text-white">Digital Asset Markets</CardTitle>
            <div className="text-sm text-gray-400">{assets.length} assets available</div>
          </CardHeader>
          <CardContent>
            {/* Enhanced Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-blue-500/10 blur-md"></div>
                <div className="relative flex items-center bg-[#0d1829]/90 rounded-lg overflow-hidden border border-blue-500/30">
                  <Search className="w-5 h-5 ml-4 text-blue-400" />
                  <Input
                    type="text"
                    placeholder="Search by name or symbol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 text-white bg-transparent border-0 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />

                  <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-1 text-blue-400 hover:text-blue-300 hover:bg-[#243860]"
                      >
                        <SlidersHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 bg-[#1a2b4b] border-gray-700 text-white">
                      <DropdownMenuLabel>Advanced Filters</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-700" />

                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-gray-400">Asset Type</DropdownMenuLabel>
                        <div className="px-3 py-2">
                          <Select value={assetType} onValueChange={(value) => setAssetType(value as AssetType)}>
                            <SelectTrigger className="bg-[#243860] text-white border-gray-700">
                              <SelectValue placeholder="Asset Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="cryptocurrency">Cryptocurrency</SelectItem>
                              <SelectItem value="stock">Stock</SelectItem>
                              <SelectItem value="forex">Forex</SelectItem>
                              <SelectItem value="commodity">Commodity</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator className="bg-gray-700" />

                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-gray-400">Price Range</DropdownMenuLabel>
                        <div className="px-3 py-2">
                          <div className="flex justify-between mb-2 text-sm">
                            <span>${formatNumber(priceRange[0])}</span>
                            <span>${priceRange[1] === maxPriceValue ? "Max" : formatNumber(priceRange[1])}</span>
                          </div>
                          <Slider
                            value={priceRange}
                            min={0}
                            max={maxPriceValue}
                            step={maxPriceValue / 100}
                            onValueChange={(newValue) => {
                              // Assuming newValue is an array with two elements (min, max)
                              setPriceRange([newValue[0], newValue[1]]);
                            }}
                            className="[&>span:first-child]:bg-blue-500 [&>span:first-child]:h-2 [&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white"
                          />
                        </div>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator className="bg-gray-700" />

                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-gray-400">Sort By</DropdownMenuLabel>
                        <div className="grid grid-cols-2 gap-2 px-3 py-2">
                          <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                            <SelectTrigger className="bg-[#243860] text-white border-gray-700">
                              <SelectValue placeholder="Field" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name">Name</SelectItem>
                              <SelectItem value="current_price">Price</SelectItem>
                              <SelectItem value="price_change_percentage_24h">Change</SelectItem>
                              <SelectItem value="total_volume">Volume</SelectItem>
                              <SelectItem value="market_cap">Market Cap</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
                            <SelectTrigger className="bg-[#243860] text-white border-gray-700">
                              <SelectValue placeholder="Order" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="asc">Ascending</SelectItem>
                              <SelectItem value="desc">Descending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator className="bg-gray-700" />

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 border-gray-700 text-white hover:bg-[#243860]"
                        onClick={() => {
                          clearAllFilters()
                          setIsFilterOpen(false)
                        }}
                      >
                        Reset All Filters
                      </Button>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Active filters */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {activeFilters.map((filter) => (
                    <Badge key={filter} variant="secondary" className="bg-[#243860] text-white hover:bg-[#2c4a7c]">
                      {filter}
                      <button className="ml-1 hover:text-blue-300" onClick={() => clearFilter(filter)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}

                  {activeFilters.length > 1 && (
                    <Badge
                      variant="outline"
                      className="border-gray-700 text-gray-400 hover:bg-[#243860] cursor-pointer"
                      onClick={clearAllFilters}
                    >
                      Clear All
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Results count */}
            <div className="mb-4 text-sm text-gray-400">
              Showing {filteredAndSortedAssets.length} of {assets.length} assets
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-[#0d1829]/50">
                    <TableHead className="text-white cursor-pointer" onClick={() => handleSort("name")}>
                      <div className="flex items-center">Asset {getSortIcon("name")}</div>
                    </TableHead>
                    <TableHead
                      className="text-right text-white cursor-pointer"
                      onClick={() => handleSort("current_price")}
                    >
                      <div className="flex items-center justify-end">Price (USD) {getSortIcon("current_price")}</div>
                    </TableHead>
                    <TableHead
                      className="text-right text-white cursor-pointer"
                      onClick={() => handleSort("price_change_percentage_24h")}
                    >
                      <div className="flex items-center justify-end">
                        24h Change {getSortIcon("price_change_percentage_24h")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-right text-white cursor-pointer"
                      onClick={() => handleSort("total_volume")}
                    >
                      <div className="flex items-center justify-end">24h Volume {getSortIcon("total_volume")}</div>
                    </TableHead>
                    <TableHead
                      className="text-right text-white cursor-pointer"
                      onClick={() => handleSort("market_cap")}
                    >
                      <div className="flex items-center justify-end">Market Cap {getSortIcon("market_cap")}</div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-gray-400">
                        No assets found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedAssets.map((asset) => (
                      <TableRow key={asset.symbol} className="transition-colors hover:bg-[#0d1829]">
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2 border-blue-500/30">
                              {asset.symbol.toUpperCase()}
                            </Badge>
                            {asset.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-white">
                          $
                          {asset.current_price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: asset.decimals || 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`flex items-center justify-end ${
                              asset.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {asset.price_change_percentage_24h >= 0 ? (
                              <ArrowUpRight className="mr-1" size={16} />
                            ) : (
                              <ArrowDownRight className="mr-1" size={16} />
                            )}
                            {Math.abs(asset.price_change_percentage_24h).toFixed(2)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-gray-300">${formatNumber(asset.total_volume)}</TableCell>
                        <TableCell className="text-right text-gray-300">${formatNumber(asset.market_cap)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

