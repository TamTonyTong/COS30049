"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Search, X } from "lucide-react"
import { Input } from "@/src/components/ui/input"
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
  image?: string
  collection?: string
}

interface Collection {
  id: string
  name: string
  image?: string
  count: number
}

export default function NFTCollectionGrid() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("")

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

  const fetchAssets = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/assets")
      if (!response.ok) throw new Error("Network response was not ok")

      const data = await response.json()
      if (data.assets && Array.isArray(data.assets)) {
        setAssets(data.assets)

        // Group assets by collection
        const collectionMap = new Map<string, { assets: Asset[]; image?: string }>()

        data.assets.forEach((asset: Asset) => {
          // Use the collection property if available, otherwise use the first part of the symbol as a fallback
          const collectionName = asset.collection || asset.symbol.split("-")[0] || "Uncategorized"

          if (!collectionMap.has(collectionName)) {
            collectionMap.set(collectionName, {
              assets: [],
              image: asset.img || asset.image,
            })
          }

          collectionMap.get(collectionName)?.assets.push(asset)
        })

        // Convert map to array of collections
        const collectionsArray: Collection[] = Array.from(collectionMap.entries()).map(([name, data]) => ({
          id: name.toLowerCase().replace(/\s+/g, "-"),
          name,
          image: data.image,
          count: data.assets.length,
        }))

        setCollections(collectionsArray)
      } else {
        setAssets([])
        setCollections([])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Error fetching data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCollectionClick = (collectionId: string) => {
    setSelectedCollection(collectionId)
  }

  const handleBackToCollections = () => {
    setSelectedCollection(null)
    setSearchTerm("")
  }

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset)
    setIsModalOpen(true)
  }

  const getCollectionAssets = () => {
    if (!selectedCollection) return []

    return assets.filter((asset) => {
      const assetCollection = asset.collection || asset.symbol.split("-")[0] || "Uncategorized"
      return assetCollection.toLowerCase().replace(/\s+/g, "-") === selectedCollection
    })
  }

  // Filter collections based on search term
  const filteredCollections = collections.filter(
    (collection) =>
      debouncedSearchTerm === "" || collection.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
  )

  // Filter assets in the selected collection based on search term
  const filteredCollectionAssets = getCollectionAssets().filter(
    (asset) =>
      debouncedSearchTerm === "" ||
      asset.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-400 border rounded-md border-red-500/30 bg-red-500/10">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
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
                  ? `Search in ${collections.find((c) => c.id === selectedCollection)?.name}...`
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
        // Display NFTs in the selected collection
        <div>
          <div className="flex items-center mb-6">
            <button
              onClick={handleBackToCollections}
              className="flex items-center px-3 py-2 mr-4 text-sm text-blue-300 transition-all rounded-md bg-blue-500/20 hover:bg-blue-500/30 hover:shadow-glow-sm"
            >
              ← Back to Collections
            </button>
            <h2 className="text-xl font-bold text-white">
              {collections.find((c) => c.id === selectedCollection)?.name} Collection
              <Badge className="ml-2 text-blue-300 bg-blue-500/20">{filteredCollectionAssets.length} NFTs</Badge>
            </h2>
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
                      src={asset.img || asset.image || "/placeholder.svg?height=300&width=300"}
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
        // Display collections
        <div>
          <h2 className="mb-6 text-2xl font-bold text-white">NFT Collections</h2>

          {filteredCollections.length === 0 ? (
            <div className="p-8 text-center text-gray-400 border rounded-md border-blue-500/20">
              No collections found matching your search criteria
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredCollections.map((collection) => (
                <Card
                  key={collection.id}
                  className="overflow-hidden transition-all border cursor-pointer bg-[#0d1829] border-blue-500/30 hover:border-blue-400/50 hover:shadow-glow group"
                  onClick={() => handleCollectionClick(collection.id)}
                >
                  <div className="relative aspect-square">
                    <Image
                      src={collection.image || "/placeholder.svg?height=300&width=300"}
                      alt={collection.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-[#0d1829] via-transparent to-transparent group-hover:opacity-100"></div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white truncate">{collection.name}</h3>
                      <Badge className="text-blue-300 bg-blue-500/20">{collection.count}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Asset Detail Modal */}
      <AssetDetailModal asset={selectedAsset} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

