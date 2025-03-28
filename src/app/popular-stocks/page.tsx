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
import { RefreshCw, Search, X, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import AssetDetailModal from "@/src/components/asset-detail-modal"

interface Asset {
  assetid: string
  symbol: string
  name: string
  price: number
  currencypair: string
  assettype: string
  creatorid: string | null
  createdat: string | null
  img?: string
}

interface Collection {
  id: string
  name: string
  image?: string
  totalsupply: number
  createdat: string | null // Add createdat
  creatorWallet: string // Add creatorWallet
  assets: Asset[]
}

export default function MarketsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("")

  // Fetch collections
  const fetchCollections = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/assets")
      if (!response.ok) throw new Error("Network response was not ok")

      const data = await response.json()
      if (data.collections && Array.isArray(data.collections)) {
        console.log("Fetched collections:", data.collections); // Log to verify
        setCollections(data.collections)
      } else {
        setCollections([])
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
    fetchCollections()
  }, [])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Filter collections based on search term
  const filteredCollections = useMemo(() => {
    return collections.filter(
      (collection) =>
        debouncedSearchTerm === "" ||
        collection.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [collections, debouncedSearchTerm])

  // Filter assets in the selected collection
  const filteredCollectionAssets = useMemo(() => {
    if (!selectedCollection) return []
    return selectedCollection.assets.filter(
      (asset) =>
        debouncedSearchTerm === "" ||
        asset.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [selectedCollection, debouncedSearchTerm])

  // Handle collection click
  const handleCollectionClick = (collection: Collection) => {
    setSelectedCollection(collection)
    setSearchTerm("") // Reset search when entering a collection
  }

  // Handle back to collections
  const handleBackToCollections = () => {
    setSelectedCollection(null)
    setSearchTerm("")
  }

  // Handle asset click
  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset)
    setIsModalOpen(true)
  }

  // Format the createdat date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
                onClick={fetchCollections}
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Try Again
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
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-900/5 via-indigo-900/5 to-purple-900/5"></div>

          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl font-bold text-white">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  {selectedCollection ? `${selectedCollection.name} Collection` : "NFT Collections"}
                </CardTitle>
                {selectedCollection && (
                  <div className="mt-2 text-sm text-gray-400">
                    <p>Created on: {formatDate(selectedCollection.createdat)}</p>
                    <p>Creator: {selectedCollection.creatorWallet}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Link href="/markets">
                  <Button
                    variant="outline"
                    className="text-white transition-all border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-400/50 hover:shadow-glow-sm"
                  >
                    Market
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-blue-400 hover:text-blue-300 hover:bg-[#243860] hover:shadow-glow-sm transition-all"
                  onClick={fetchCollections}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-blue-500/10 blur-md"></div>
                <div className="relative flex items-center bg-[#0d1829]/90 rounded-lg overflow-hidden border border-blue-500/30 hover:border-blue-400/50 transition-colors">
                  <Search className="w-5 h-5 ml-4 text-blue-400" />
                  <Input
                    type="text"
                    placeholder={
                      selectedCollection
                        ? `Search in ${selectedCollection.name}...`
                        : "Search collections..."
                    }
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
                </div>
              </div>
            </div>

            {selectedCollection ? (
              // NFT Grid for Selected Collection
              <div>
                <div className="flex items-center mb-6">
                  <button
                    onClick={handleBackToCollections}
                    className="flex items-center px-3 py-2 mr-4 text-sm text-blue-300 transition-all rounded-md bg-blue-500/20 hover:bg-blue-500/30 hover:shadow-glow-sm"
                  >
                    ← Back to Collections
                  </button>
                  <Badge className="ml-2 text-blue-300 bg-blue-500/20">
                    {filteredCollectionAssets.length} NFTs
                  </Badge>
                </div>

                {filteredCollectionAssets.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 border rounded-md border-blue-500/20">
                    No NFTs found matching your search criteria
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredCollectionAssets.map((asset) => (
                      <Card
                        key={asset.assetid}
                        className="overflow-hidden transition-all border cursor-pointer bg-[#0d1829] border-blue-500/30 hover:border-blue-400/50 hover:shadow-glow group"
                        onClick={() => handleAssetClick(asset)}
                      >
                        <div className="relative aspect-square">
                          <Image
                            src={asset.img || "/placeholder.svg?height=300&width=300"}
                            alt={asset.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-[#0d1829] via-transparent to-transparent group-hover:opacity-100"></div>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-white truncate">{asset.name}</h3>
                              <p className="text-sm text-blue-300">{asset.price.toFixed(2)} ETH</p>
                            </div>
                            <Badge className="text-blue-300 bg-blue-500/20">NFT</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Collections Table
              <div className="relative overflow-x-auto border rounded-md border-blue-500/20">
                <Table>
                  <TableHeader className="bg-[#0d1829]/70">
                    <TableRow className="hover:bg-[#0d1829] border-b border-blue-500/20">
                      <TableHead className="text-white">Image</TableHead>
                      <TableHead className="text-white">Name</TableHead>
                      <TableHead className="text-right text-white">Total Supply</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCollections.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="py-8 text-center text-gray-400">
                          No collections found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCollections.map((collection) => (
                        <TableRow
                          key={collection.id}
                          className="transition-all duration-200 border-b border-blue-500/10 hover:bg-[#1a2b4b]/50 cursor-pointer"
                          onClick={() => handleCollectionClick(collection)}
                        >
                          <TableCell>
                            <div className="relative w-10 h-10">
                              <Image
                                src={collection.image || "/placeholder.svg?height=40&width=40"}
                                alt={collection.name}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-white">{collection.name}</TableCell>
                          <TableCell className="text-right text-white">{collection.totalsupply}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Refresh Button */}
            <div className="mt-6 text-sm text-gray-400">
              <Button
                variant="outline"
                size="sm"
                className="text-blue-400 transition-all border-blue-500/30 hover:bg-blue-500/20 hover:shadow-glow-sm"
                onClick={fetchCollections}
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