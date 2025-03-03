"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { Badge } from "@/src/components/ui/badge"
import { useRouter } from "next/navigation"
import { SearchSuggestions } from "./search-suggestions"

type AssetType = "crypto" | "stocks" | "forex" | "commodities" | "all"
type PriceRange = "all" | "under10" | "10to100" | "100to1000" | "over1000"
type SortOrder = "nameAsc" | "nameDesc" | "priceAsc" | "priceDesc" | "changeAsc" | "changeDesc"

export default function EnhancedSearchBar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [assetType, setAssetType] = useState<AssetType>("crypto")
  const [priceRange, setPriceRange] = useState<PriceRange>("all")
  const [sortOrder, setSortOrder] = useState<SortOrder>("nameAsc")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const router = useRouter()
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Update active filters whenever filter options change
  useEffect(() => {
    const newActiveFilters: string[] = []

    if (assetType !== "all") {
      newActiveFilters.push(getAssetTypeLabel(assetType))
    }

    if (priceRange !== "all") {
      newActiveFilters.push(getPriceRangeLabel(priceRange))
    }

    if (sortOrder !== "nameAsc") {
      newActiveFilters.push(getSortOrderLabel(sortOrder))
    }

    setActiveFilters(newActiveFilters)
  }, [assetType, priceRange, sortOrder])

  const handleSearch = () => {
    setShowSuggestions(false)
    // Always redirect to crypto markets page for now
    let targetUrl = "/markets/crypto"

    // Build query parameters
    const params = new URLSearchParams()

    if (searchTerm) {
      params.append("search", searchTerm)
    }

    if (priceRange !== "all") {
      const [min, max] = getPriceRangeValues(priceRange)
      params.append("minPrice", min.toString())
      params.append("maxPrice", max.toString())
    }

    const [sortBy, sortDirection] = getSortParams(sortOrder)
    params.append("sortBy", sortBy)
    params.append("sortOrder", sortDirection)

    // Navigate to the markets page with the search parameters
    if (params.toString()) {
      targetUrl += `?${params.toString()}`
    }

    router.push(targetUrl)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  const handleSuggestionSelect = (crypto: { symbol: string; name: string }) => {
    setSearchTerm(crypto.name)
    setShowSuggestions(false)
    router.push(`/markets/crypto?search=${encodeURIComponent(crypto.name)}`)
  }

  const clearFilter = (filter: string) => {
    if (getAssetTypeLabel(assetType) === filter) {
      setAssetType("all")
    } else if (getPriceRangeLabel(priceRange) === filter) {
      setPriceRange("all")
    } else if (getSortOrderLabel(sortOrder) === filter) {
      setSortOrder("nameAsc")
    }
  }

  const clearAllFilters = () => {
    setAssetType("all")
    setPriceRange("all")
    setSortOrder("nameAsc")
  }

  // Helper functions to get labels and values
  function getAssetTypeLabel(type: AssetType): string {
    const labels: Record<AssetType, string> = {
      all: "All Assets",
      crypto: "Cryptocurrency",
      stocks: "Stocks",
      forex: "Forex",
      commodities: "Commodities",
    }
    return labels[type]
  }

  function getPriceRangeLabel(range: PriceRange): string {
    const labels: Record<PriceRange, string> = {
      all: "Any Price",
      under10: "Under $10",
      "10to100": "$10 - $100",
      "100to1000": "$100 - $1,000",
      over1000: "Over $1,000",
    }
    return labels[range]
  }

  function getPriceRangeValues(range: PriceRange): [number, number] {
    const ranges: Record<PriceRange, [number, number]> = {
      all: [0, 1000000],
      under10: [0, 10],
      "10to100": [10, 100],
      "100to1000": [100, 1000],
      over1000: [1000, 1000000],
    }
    return ranges[range]
  }

  function getSortOrderLabel(order: SortOrder): string {
    const labels: Record<SortOrder, string> = {
      nameAsc: "Name (A-Z)",
      nameDesc: "Name (Z-A)",
      priceAsc: "Price (Low to High)",
      priceDesc: "Price (High to Low)",
      changeAsc: "Change (Low to High)",
      changeDesc: "Change (High to Low)",
    }
    return labels[order]
  }

  function getSortParams(order: SortOrder): [string, string] {
    switch (order) {
      case "nameAsc":
        return ["name", "asc"]
      case "nameDesc":
        return ["name", "desc"]
      case "priceAsc":
        return ["price", "asc"]
      case "priceDesc":
        return ["price", "desc"]
      case "changeAsc":
        return ["change", "asc"]
      case "changeDesc":
        return ["change", "desc"]
      default:
        return ["name", "asc"]
    }
  }

  return (
    <div className="w-full">
      <div className="relative" ref={searchContainerRef}>
        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
        <div className="relative flex items-center bg-[#1a2b4b]/80 rounded-full overflow-hidden border border-blue-500/30">
          <Search className="w-5 h-5 text-blue-400 ml-4" />
          <Input
            type="text"
            placeholder="Search Markets Here..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            className="border-0 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
          />

          <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-1 text-blue-400 hover:text-blue-300 hover:bg-[#243860]">
                <Filter className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#1a2b4b] border-gray-700 text-white">
              <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />

              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-gray-400">Asset Type</DropdownMenuLabel>
                <DropdownMenuItem
                  className={assetType === "all" ? "bg-blue-500/20" : ""}
                  onClick={() => setAssetType("all")}
                >
                  All Assets
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={assetType === "crypto" ? "bg-blue-500/20" : ""}
                  onClick={() => setAssetType("crypto")}
                >
                  Cryptocurrency
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={assetType === "stocks" ? "bg-blue-500/20" : ""}
                  onClick={() => setAssetType("stocks")}
                >
                  Stocks
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={assetType === "forex" ? "bg-blue-500/20" : ""}
                  onClick={() => setAssetType("forex")}
                >
                  Forex
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={assetType === "commodities" ? "bg-blue-500/20" : ""}
                  onClick={() => setAssetType("commodities")}
                >
                  Commodities
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="bg-gray-700" />

              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-gray-400">Price Range</DropdownMenuLabel>
                <DropdownMenuItem
                  className={priceRange === "all" ? "bg-blue-500/20" : ""}
                  onClick={() => setPriceRange("all")}
                >
                  Any Price
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={priceRange === "under10" ? "bg-blue-500/20" : ""}
                  onClick={() => setPriceRange("under10")}
                >
                  Under $10
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={priceRange === "10to100" ? "bg-blue-500/20" : ""}
                  onClick={() => setPriceRange("10to100")}
                >
                  $10 - $100
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={priceRange === "100to1000" ? "bg-blue-500/20" : ""}
                  onClick={() => setPriceRange("100to1000")}
                >
                  $100 - $1,000
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={priceRange === "over1000" ? "bg-blue-500/20" : ""}
                  onClick={() => setPriceRange("over1000")}
                >
                  Over $1,000
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="bg-gray-700" />

              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-gray-400">Sort By</DropdownMenuLabel>
                <DropdownMenuItem
                  className={sortOrder === "nameAsc" ? "bg-blue-500/20" : ""}
                  onClick={() => setSortOrder("nameAsc")}
                >
                  Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortOrder === "nameDesc" ? "bg-blue-500/20" : ""}
                  onClick={() => setSortOrder("nameDesc")}
                >
                  Name (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortOrder === "priceAsc" ? "bg-blue-500/20" : ""}
                  onClick={() => setSortOrder("priceAsc")}
                >
                  Price (Low to High)
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortOrder === "priceDesc" ? "bg-blue-500/20" : ""}
                  onClick={() => setSortOrder("priceDesc")}
                >
                  Price (High to Low)
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortOrder === "changeAsc" ? "bg-blue-500/20" : ""}
                  onClick={() => setSortOrder("changeAsc")}
                >
                  Change (Low to High)
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortOrder === "changeDesc" ? "bg-blue-500/20" : ""}
                  onClick={() => setSortOrder("changeDesc")}
                >
                  Change (High to Low)
                </DropdownMenuItem>
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
                Reset Filters
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="mr-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full" onClick={handleSearch}>
            Search
          </Button>
        </div>

        {/* Search Suggestions */}
        <SearchSuggestions
          searchTerm={searchTerm}
          onSelect={handleSuggestionSelect}
          isOpen={showSuggestions && searchTerm.length >= 2}
        />
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          {activeFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="bg-[#243860] text-white hover:bg-[#2c4a7c]">
              {filter}
              <button className="ml-1 hover:text-blue-300" onClick={() => clearFilter(filter)}>
                <X className="h-3 w-3" />
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
  )
}

