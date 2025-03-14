"use client"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { useState, useEffect, useMemo } from "react"
import Layout from "@/src/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
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
import { RefreshCw, Info, Search, X, SlidersHorizontal, ArrowUp, ArrowDown, Sparkles } from "lucide-react"
import Link from "next/link"
import AssetDetailModal from "@/src/components/asset-detail-modal"

interface Asset {
  symbol: string
  name: string
  price: number
  currencypair: string
  assettype: string
}

interface Crypto {
  id: number
  symbol: string
  name: string
  price: number
}

type SortField = "name" | "price"
type SortOrder = "asc" | "desc"
type PriceRange = [number, number]
type AssetType = "all" | "nft"

export default function MarketsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [priceRange, setPriceRange] = useState<PriceRange>([0, 10]) // Default ETH range
  const [debouncedPriceRange, setDebouncedPriceRange] = useState<PriceRange>([0, 40])
  const [assetType, setAssetType] = useState<AssetType>("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [maxPriceValue, setMaxPriceValue] = useState(10) // Default max ETH value

  // Helper function to get sort label
  const getSortLabel = (field: SortField, order: SortOrder): string => {
    const fieldLabels: Record<SortField, string> = {
      name: "Name",
      price: "Price",
    }
    return `${fieldLabels[field]} (${order === "asc" ? "Low to High" : "High to Low"})`
  }

  // Helper function to get asset type label
  const getAssetTypeLabel = (type: AssetType): string => {
    const labels: Record<AssetType, string> = {
      all: "All Types",
      nft: "NFT",
    }
    return labels[type]
  }

  const fetchAssets = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/assets") // Ensure API returns ETH prices only
      if (!response.ok) throw new Error("Network response was not ok")

      const data = await response.json()
      if (data.assets && Array.isArray(data.assets)) {
        setAssets(data.assets)
        setLastUpdated(new Date())

        // Find the highest ETH price for filter range
        const highestPriceEth = Math.ceil(Math.max(...data.assets.map((a: Asset) => a.price)) * 1.2)
        setMaxPriceValue(highestPriceEth)
        setPriceRange([0, highestPriceEth])
        setDebouncedPriceRange([0, highestPriceEth])
      } else {
        setAssets([])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Error fetching data. Please try again.")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [])

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

    if (sortField !== "name" || sortOrder !== "asc") {
      newActiveFilters.push(getSortLabel(sortField, sortOrder))
    }

    if (debouncedPriceRange[0] > 0 || debouncedPriceRange[1] < maxPriceValue) {
      newActiveFilters.push(
        `Price: ${formatEthNumber(debouncedPriceRange[0])} - ${debouncedPriceRange[1] === maxPriceValue ? "Max" : formatEthNumber(debouncedPriceRange[1])} ETH`,
      )
    }

    if (assetType !== "all") {
      newActiveFilters.push(`Type: ${getAssetTypeLabel(assetType)}`)
    }

    setActiveFilters(newActiveFilters)
  }, [sortField, sortOrder, debouncedPriceRange, assetType, maxPriceValue])

  // Format the last updated time
  const getLastUpdatedText = () => {
    if (!lastUpdated) return "never"

    // If it's less than a minute ago, show "just now"
    const diffMs = Date.now() - lastUpdated.getTime()
    if (diffMs < 60000) return "just now"

    // Otherwise show the time
    return lastUpdated.toLocaleTimeString()
  }

  // Helper function to format numbers with commas
  function formatNumber(num: number): string {
    return num.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })
  }

  // Helper function to format ETH numbers with 2 decimal
  function formatEthNumber(num: number): string {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Format ETH price display
  const formatPrice = (ethPrice: number): string => {
    return `${ethPrice.toFixed(2)} ETH`
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
      setSortField("name")
      setSortOrder("asc")
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setPriceRange([0, maxPriceValue])
    setSortField("name")
    setSortOrder("asc")
    setAssetType("all")
    setSearchTerm("")
  }

  // Handle search suggestion selection
  const handleSuggestionSelect = (crypto: Crypto) => {
    setSearchTerm(crypto.name)
    setIsSearchOpen(false)
  }

  // Handle opening the asset detail modal
  const handleOpenAssetDetail = (asset: Asset) => {
    setSelectedAsset(asset)
    setIsModalOpen(true)
  }

  // Filter and sort assets
  const filteredAndSortedAssets = useMemo(() => {
    // First filter by search term, price range, and asset type
    const filtered = assets.filter((asset) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        asset.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(debouncedSearchTerm.toLowerCase())

      const matchesPrice = asset.price >= debouncedPriceRange[0] && asset.price <= debouncedPriceRange[1]

      const matchesType = assetType === "all" || asset.assettype === assetType

      return matchesSearch && matchesPrice && matchesType
    })

    // Then sort the filtered assets
    return filtered.sort((a, b) => {
      if (sortField === "name") {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else {
        return sortOrder === "asc" ? a.price - b.price : b.price - a.price
      }
    })
  }, [assets, debouncedSearchTerm, debouncedPriceRange, assetType, sortField, sortOrder])

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
              <Button
                variant="outline"
                className="mt-4 text-blue-400 border-blue-500/30 hover:bg-blue-500/20"
                onClick={fetchAssets}
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Try Again
              </Button>
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
              <Button
                variant="outline"
                className="mt-4 text-blue-400 border-blue-500/30 hover:bg-blue-500/20"
                onClick={fetchAssets}
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto">
        <Card className="border-blue-500/30 bg-[#0d1829] overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-900/5 via-indigo-900/5 to-purple-900/5"></div>

          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-white">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Digital Asset Markets
              </CardTitle>
              <div className="flex items-center gap-3">
                <Link href="/markets">
                  <Button
                    variant="outline"
                    className="text-white transition-all border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-400/50 hover:shadow-glow-sm"
                  >
                    Trade
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-blue-400 hover:text-blue-300 hover:bg-[#243860] hover:shadow-glow-sm transition-all"
                  onClick={fetchAssets}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            {/* Enhanced Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-blue-500/10 blur-md"></div>
                <div className="relative flex items-center bg-[#0d1829]/90 rounded-lg overflow-hidden border border-blue-500/30 hover:border-blue-400/50 transition-colors">
                  <Search className="w-5 h-5 ml-4 text-blue-400" />
                  <Input
                    type="text"
                    placeholder="Search by name or symbol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchOpen(true)}
                    onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                    className="flex-1 text-white bg-transparent border-0 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />

                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mr-1 text-gray-400 hover:text-white hover:bg-transparent"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}

                  <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-1 text-blue-400 hover:text-blue-300 hover:bg-[#243860] transition-colors"
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
                            <SelectTrigger className="bg-[#243860] text-white border-gray-700 hover:border-blue-500/30 transition-colors">
                              <SelectValue placeholder="Asset Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="nft">NFT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator className="bg-gray-700" />

                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-gray-400">Price Range (ETH)</DropdownMenuLabel>
                        <div className="px-3 py-2">
                          <div className="flex justify-between mb-2 text-sm">
                            <span>{formatEthNumber(priceRange[0])} ETH</span>
                            <span>{priceRange[1] === maxPriceValue ? "Max" : formatEthNumber(priceRange[1])} ETH</span>
                          </div>
                          <Slider
                            value={priceRange}
                            min={0}
                            max={maxPriceValue}
                            step={maxPriceValue / 100}
                            onValueChange={(newValue) => {
                              setPriceRange([newValue[0], newValue[1]])
                            }}
                            className="[&>span:first-child]:bg-blue-500 [&>span:first-child]:h-2 [&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:hover:shadow-glow-sm"
                          />
                        </div>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator className="bg-gray-700" />

                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-gray-400">Sort By</DropdownMenuLabel>
                        <div className="grid grid-cols-2 gap-2 px-3 py-2">
                          <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                            <SelectTrigger className="bg-[#243860] text-white border-gray-700 hover:border-blue-500/30 transition-colors">
                              <SelectValue placeholder="Field" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name">Name</SelectItem>
                              <SelectItem value="price">Price</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
                            <SelectTrigger className="bg-[#243860] text-white border-gray-700 hover:border-blue-500/30 transition-colors">
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
                        className="w-full mt-2 border-gray-700 text-white hover:bg-[#243860] hover:border-blue-500/30 transition-all"
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
                    <Badge
                      key={filter}
                      variant="secondary"
                      className="bg-[#243860] text-white hover:bg-[#2c4a7c] hover:shadow-glow-sm transition-all"
                    >
                      {filter}
                      <button className="ml-1 hover:text-blue-300" onClick={() => clearFilter(filter)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}

                  {activeFilters.length > 1 && (
                    <Badge
                      variant="outline"
                      className="border-gray-700 text-gray-400 hover:bg-[#243860] cursor-pointer hover:border-blue-500/30 hover:text-blue-300 transition-all"
                      onClick={clearAllFilters}
                    >
                      Clear All
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="relative overflow-x-auto border rounded-md border-blue-500/20">
              {/* Table glow effect on hover */}
              <div
                className={`absolute inset-0 opacity-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-blue-500/5 pointer-events-none transition-opacity duration-500 ${hoveredRow ? "opacity-100" : ""}`}
              ></div>

              <Table>
                <TableHeader className="bg-[#0d1829]/70">
                  <TableRow className="hover:bg-[#0d1829] border-b border-blue-500/20">
                    <TableHead className="text-white cursor-pointer" onClick={() => handleSort("name")}>
                      <div className="flex items-center">Asset {getSortIcon("name")}</div>
                    </TableHead>
                    <TableHead className="text-right text-white cursor-pointer" onClick={() => handleSort("price")}>
                      <div className="flex items-center justify-end">Price (ETH) {getSortIcon("price")}</div>
                    </TableHead>
                    <TableHead className="text-right text-white">Currency Pair</TableHead>
                    <TableHead className="text-right text-white">Asset Type</TableHead>
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
                      <TableRow
                        key={asset.symbol}
                        className={`transition-all duration-200 border-b border-blue-500/10 hover:bg-[#1a2b4b]/50 cursor-pointer ${hoveredRow === asset.symbol ? "bg-[#1a2b4b]/30 shadow-glow-sm" : ""}`}
                        onClick={() => handleOpenAssetDetail(asset)}
                        onMouseEnter={() => setHoveredRow(asset.symbol)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center">
                            <Badge
                              variant="outline"
                              className={`mr-2 border-blue-500/30 ${hoveredRow === asset.symbol ? "bg-blue-500/10 border-blue-400/50" : ""} transition-colors`}
                            >
                              {asset.symbol.toUpperCase()}
                            </Badge>
                            <span className={`${hoveredRow === asset.symbol ? "text-blue-300" : ""} transition-colors`}>
                              {asset.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell
                          className={`text-right ${hoveredRow === asset.symbol ? "text-blue-300" : "text-white"} transition-colors`}
                        >
                          {formatPrice(asset.price)}
                        </TableCell>
                        <TableCell className="text-right text-white">{asset.currencypair}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            className={`bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-colors ${hoveredRow === asset.symbol ? "shadow-glow-sm" : ""}`}
                          >
                            NFT
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Market info footer */}
            <div className="flex items-center justify-between mt-6 text-sm text-gray-400">
              <div className="flex items-center">
                <Info className="w-4 h-4 mr-2 text-blue-400" />
                Data refreshed {isRefreshing ? "now" : getLastUpdatedText()}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-400 transition-all border-blue-500/30 hover:bg-blue-500/20 hover:shadow-glow-sm"
                onClick={fetchAssets}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Refreshing..." : "Refresh Data"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Detail Modal */}
      <AssetDetailModal asset={selectedAsset} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Layout>
  )
}

