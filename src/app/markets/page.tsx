"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabaseClient"
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
import { RefreshCw, Info, Search, X, SlidersHorizontal, ArrowUp, ArrowDown } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "../../components/layout"
import Image from "next/image"

export default function TradePage() {
  interface Trade {
    tradeid: string
    symbol: string
    name: string
    img?: string
    assettype: string
    price: number
    status: "Buy" | "Sold"
    userid: string
    metawallet: string
    pricehistoryid: string
    walletid: string
    txid: string | null
  }

  const router = useRouter()
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("")
  const [sortField, setSortField] = useState<"name" | "price">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10]) // Default ETH range
  const [debouncedPriceRange, setDebouncedPriceRange] = useState<[number, number]>([0, 10])
  const [statusFilter, setStatusFilter] = useState<"all" | "Buy" | "Sold">("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [maxPriceValue, setMaxPriceValue] = useState(10) // Default max ETH value

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setIsRefreshing(true)
        const response = await fetch("/api/trade")
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        const data = await response.json()
        setTrades(data.trades)
        setLastUpdated(new Date())

        // Find the highest ETH price for filter range
        const highestPriceEth = Math.ceil(Math.max(...data.trades.map((t: Trade) => t.price)) * 1.2) || 10
        setMaxPriceValue(highestPriceEth)
        setPriceRange([0, highestPriceEth])
        setDebouncedPriceRange([0, highestPriceEth])

        data.trades.forEach((trade: Trade) => {
          if (trade.status === "Sold" && trade.txid) {
            scheduleDelayedDeletion(trade.tradeid, trade.txid)
          }
        })
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Error fetching data")
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }

    fetchTrades()

    const subscription = supabase
      .channel("trade-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Trade", filter: "status=eq.Sold" },
        (payload) => {
          const updatedTrade = payload.new as Trade
          if (updatedTrade.status === "Sold" && updatedTrade.txid) {
            scheduleDelayedDeletion(updatedTrade.tradeid, updatedTrade.txid)
            setTrades((prevTrades) =>
              prevTrades.map((trade) =>
                trade.tradeid === updatedTrade.tradeid
                  ? { ...trade, status: updatedTrade.status, txid: updatedTrade.txid }
                  : trade,
              ),
            )
          }
        },
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "Trade" }, (payload) => {
        setTrades((prevTrades) => prevTrades.filter((trade) => trade.tradeid !== payload.old.tradeid))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
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

    if (statusFilter !== "all") {
      newActiveFilters.push(`Status: ${statusFilter}`)
    }

    setActiveFilters(newActiveFilters)
  }, [sortField, sortOrder, debouncedPriceRange, statusFilter, maxPriceValue])

  const scheduleDelayedDeletion = async (tradeid: string, txid: string) => {
    try {
      const { data: transactionData, error: transactionError } = await supabase
        .from("Transaction")
        .select("timestamp")
        .eq("txid", txid)
        .single()

      if (transactionError || !transactionData) {
        console.error("Failed to fetch transaction:", transactionError?.message)
        return
      }

      const transactionTimestamp = new Date(transactionData.timestamp).getTime()
      const currentTime = new Date().getTime()
      const DELETION_DELAY_MS = 1800000 // 30 minutes
      const timeElapsed = currentTime - transactionTimestamp
      const remainingDelay = Math.max(DELETION_DELAY_MS - timeElapsed, 0)

      if (timeElapsed >= DELETION_DELAY_MS) {
        console.log(`Trade ${tradeid} delay has passed. Deleting immediately.`)
        const { error: deleteError } = await supabase.from("Trade").delete().eq("tradeid", tradeid)
        if (deleteError) {
          console.error("Failed to delete trade:", deleteError.message)
        } else {
          setTrades((prevTrades) => prevTrades.filter((t) => t.tradeid !== tradeid))
        }
        return
      }

      console.log(`Scheduling deletion for trade ${tradeid} in ${remainingDelay / 1000} seconds`)

      setTimeout(async () => {
        try {
          const { data: tradeStatusData, error: tradeStatusError } = await supabase
            .from("Trade")
            .select("status")
            .eq("tradeid", tradeid)
            .single()

          if (tradeStatusError || !tradeStatusData) {
            console.error("Failed to fetch trade status:", tradeStatusError?.message)
            return
          }

          if (tradeStatusData.status !== "Sold") {
            console.log(`Trade ${tradeid} is no longer "Sold" (status: ${tradeStatusData.status}). Skipping deletion.`)
            return
          }

          const { error: deleteError } = await supabase.from("Trade").delete().eq("tradeid", tradeid)

          if (deleteError) {
            console.error("Failed to delete trade:", deleteError.message)
          } else {
            console.log(`Trade ${tradeid} deleted after ${DELETION_DELAY_MS / 1000} seconds`)
            setTrades((prevTrades) => prevTrades.filter((t) => t.tradeid !== tradeid))
          }
        } catch (err) {
          console.error("Error in delayed deletion:", err)
        }
      }, remainingDelay)
    } catch (err) {
      console.error("Error scheduling deletion:", err)
    }
  }

  // Helper function to get sort label
  const getSortLabel = (field: "name" | "price", order: "asc" | "desc"): string => {
    const fieldLabels: Record<"name" | "price", string> = {
      name: "Name",
      price: "Price",
    }
    return `${fieldLabels[field]} (${order === "asc" ? "Low to High" : "High to Low"})`
  }

  // Format the last updated time
  const getLastUpdatedText = () => {
    if (!lastUpdated) return "never"

    // If it's less than a minute ago, show "just now"
    const diffMs = Date.now() - lastUpdated.getTime()
    if (diffMs < 60000) return "just now"

    // Otherwise show the time
    return lastUpdated.toLocaleTimeString()
  }

  // Helper function to format ETH numbers with 2 decimal places
  function formatEthNumber(num: number): string {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Handle sort toggle
  const handleSort = (field: "name" | "price") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc") // Default to descending when changing fields
    }
  }

  // Get sort icon
  const getSortIcon = (field: "name" | "price") => {
    if (sortField !== field) return null
    return sortOrder === "asc" ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
  }

  // Clear a specific filter
  const clearFilter = (filter: string) => {
    if (filter.startsWith("Price:")) {
      setPriceRange([0, maxPriceValue])
    } else if (filter.startsWith("Status:")) {
      setStatusFilter("all")
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
    setStatusFilter("all")
    setSearchTerm("")
  }

  // Refresh trades
  const refreshTrades = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/trade")
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      const data = await response.json()
      setTrades(data.trades)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error refreshing data:", error)
      setError("Error refreshing data")
    } finally {
      setIsRefreshing(false)
    }
  }

  // Filter and sort trades
  const filteredAndSortedTrades = useMemo(() => {
    // First filter by search term, price range, and status
    const filtered = trades.filter((trade) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        trade.symbol.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        trade.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())

      const matchesPrice = trade.price >= debouncedPriceRange[0] && trade.price <= debouncedPriceRange[1]

      const matchesStatus = statusFilter === "all" || trade.status === statusFilter

      return matchesSearch && matchesPrice && matchesStatus
    })

    // Then sort the filtered trades
    return filtered.sort((a, b) => {
      if (sortField === "name") {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else {
        return sortOrder === "asc" ? a.price - b.price : b.price - a.price
      }
    })
  }, [trades, debouncedSearchTerm, debouncedPriceRange, statusFilter, sortField, sortOrder])

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
                onClick={refreshTrades}
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  if (trades.length === 0) {
    return (
      <Layout>
        <div className="container px-4 py-8 mx-auto">
          <Card className="border-blue-500/30 bg-[#1a2b4b]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">No Trades Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">No trades are available.</p>
              <Button
                variant="outline"
                className="mt-4 text-blue-400 border-blue-500/30 hover:bg-blue-500/20"
                onClick={refreshTrades}
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
              <CardTitle className="text-2xl font-bold text-white">Trade Market</CardTitle>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-400">
                  {filteredAndSortedTrades.length} of {trades.length} trades
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-blue-400 hover:text-blue-300 hover:bg-[#243860] hover:shadow-glow-sm transition-all"
                  onClick={refreshTrades}
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
                    placeholder="Search by symbol or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                        <DropdownMenuLabel className="text-xs text-gray-400">Status</DropdownMenuLabel>
                        <div className="px-3 py-2">
                          <Select
                            value={statusFilter}
                            onValueChange={(value) => setStatusFilter(value as "all" | "Buy" | "Sold")}
                          >
                            <SelectTrigger className="bg-[#243860] text-white border-gray-700 hover:border-blue-500/30 transition-colors">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="Buy">Available</SelectItem>
                              <SelectItem value="Sold">Sold</SelectItem>
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
                          <Select value={sortField} onValueChange={(value) => setSortField(value as "name" | "price")}>
                            <SelectTrigger className="bg-[#243860] text-white border-gray-700 hover:border-blue-500/30 transition-colors">
                              <SelectValue placeholder="Field" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name">Name</SelectItem>
                              <SelectItem value="price">Price</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
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
                    <TableHead className="text-white">Asset</TableHead>
                    <TableHead className="text-white cursor-pointer" onClick={() => handleSort("name")}>
                      <div className="flex items-center">Symbol {getSortIcon("name")}</div>
                    </TableHead>
                    <TableHead className="text-white">Name</TableHead>
                    <TableHead className="text-right text-white cursor-pointer" onClick={() => handleSort("price")}>
                      <div className="flex items-center justify-end">Price (ETH) {getSortIcon("price")}</div>
                    </TableHead>
                    <TableHead className="text-right text-white">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTrades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-gray-400">
                        No trades found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedTrades.map((trade) => (
                      <TableRow
                        key={trade.tradeid}
                        className={`transition-all duration-200 border-b border-blue-500/10 hover:bg-[#1a2b4b]/50 ${hoveredRow === trade.tradeid ? "bg-[#1a2b4b]/30 shadow-glow-sm" : ""}`}
                        onMouseEnter={() => setHoveredRow(trade.tradeid)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <TableCell className="text-white">
                          <div className="relative w-12 h-12 overflow-hidden rounded-md border border-blue-500/20 hover:border-blue-400/50 transition-all">
                            <Image
                              src={trade.img || "/placeholder.svg"}
                              alt={`${trade.name} preview`}
                              fill
                              className="object-contain rounded-sm"
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2 border-blue-500/30">
                              {trade.symbol.toUpperCase()}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell
                          className={`text-white ${hoveredRow === trade.tradeid ? "text-blue-300" : ""} transition-colors`}
                        >
                          {trade.name}
                        </TableCell>
                        <TableCell
                          className={`text-right ${hoveredRow === trade.tradeid ? "text-blue-300" : "text-white"} transition-colors`}
                        >
                          {trade.price.toFixed(2)} ETH
                        </TableCell>
                        <TableCell className="text-right align-middle">
                          {trade.status === "Sold" ? (
                            <Badge variant="secondary" className="px-2 py-1 text-black bg-gray-200 rounded">
                              Sold
                            </Badge>
                          ) : (
                            <Button
                              onClick={() => {
                                if (localStorage.getItem("isLoggedIn") === "false") {
                                  router.push("/login")
                                } else {
                                  router.push(
                                    `/markets/buy?tradeid=${trade.tradeid}&userid=${trade.userid}&metawallet=${trade.metawallet}&pricehistoryid=${trade.pricehistoryid}&price=${trade.price}&walletid=${trade.walletid}`,
                                  )
                                }
                              }}
                              className="relative group overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white font-medium px-3 py-1 rounded-lg shadow-lg hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1"
                            >
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Buy
                              </span>
                              <span className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 "></span>
                            </Button>
                          )}
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
                onClick={refreshTrades}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Refreshing..." : "Refresh Data"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

