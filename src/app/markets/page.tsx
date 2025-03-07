"use client"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { ArrowUp, ArrowDown, RefreshCw } from "lucide-react"
import Layout from "@/src/components/layout"
import MarketsClient from "@/src/components/markets-client"

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

// Loading component for Suspense fallback
function MarketsLoading() {
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

// Main component that uses searchParams
function MarketsContent() {
  const searchParams = useSearchParams()

  // Get initial values from URL parameters
  const initialSearchTerm = searchParams?.get("search") || ""
  const initialSortField = (searchParams?.get("sortBy") as SortField) || "market_cap"
  const initialSortOrder = (searchParams?.get("sortOrder") as SortOrder) || "desc"
  const initialMinPrice = Number(searchParams?.get("minPrice") || "0")
  const initialMaxPrice = Number(searchParams?.get("maxPrice") || "1000000")
  const initialAssetType = (searchParams?.get("assetType") as AssetType) || "all"

  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

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
  const fetchData = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/assets")
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      const data = await response.json()

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
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Error fetching data")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
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

  // Handle refresh
  const handleRefresh = () => {
    fetchData()
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
              <Button
                variant="outline"
                className="mt-4 text-blue-400 border-blue-500/30 hover:bg-blue-500/20"
                onClick={handleRefresh}
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
                onClick={handleRefresh}
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
        <MarketsClient />
      </div>
    </Layout>
  )
}

// Main page component with Suspense
export default function MarketsPage() {
  return (
    <Suspense fallback={<MarketsLoading />}>
      <MarketsContent />
    </Suspense>
  )
}

