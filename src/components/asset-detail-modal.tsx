"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/src/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { ExternalLink, User, FileText, Heart, Share2 } from "lucide-react"
import Image from "next/image"

interface Asset {
  symbol: string
  name: string
  price: number
  currencypair: string
  assettype: string
}

interface AssetDetailModalProps {
  asset: Asset | null
  isOpen: boolean
  onClose: () => void
}

export default function AssetDetailModal({ asset, isOpen, onClose }: AssetDetailModalProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Reset states when modal opens with a new asset
  useEffect(() => {
    if (isOpen && asset) {
      setImageLoaded(false)
    }
  }, [isOpen, asset])

  if (!asset) return null

  // Generate a unique image URL based on the asset symbol for demonstration
  const imageUrl = `/placeholder.svg?height=500&width=500&text=${asset.symbol}`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] p-0 bg-[#0d1829] border-blue-500/30 text-white overflow-hidden">
        <div className="relative">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-indigo-900/20 to-purple-900/20 animate-gradient-slow"></div>

          {/* NFT Image Display with loading animation */}
          <div className="relative w-full h-[300px] sm:h-[350px] overflow-hidden group">
            {/* Shimmer loading effect */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d1829] via-[#1a2b4b] to-[#0d1829] bg-[length:400%_100%] animate-shimmer"></div>
            )}

            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={`${asset.name} NFT`}
              fill
              className={`object-contain p-4 transition-all duration-700 ${imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
              onLoadingComplete={() => setImageLoaded(true)}
            />

            {/* Hover effect glow */}
            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10"></div>

            {/* Top action buttons */}
            <div className="absolute flex gap-2 transition-opacity duration-300 opacity-0 top-4 right-4 group-hover:opacity-100">
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 rounded-full bg-[#1a2b4b]/80 hover:bg-blue-500/30 hover:text-blue-300 hover:shadow-glow transition-all"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsLiked(!isLiked)
                }}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 rounded-full bg-[#1a2b4b]/80 hover:bg-blue-500/30 hover:text-blue-300 hover:shadow-glow transition-all"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Bottom info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0d1829] to-transparent">
              <div className="flex items-center justify-between">
                <Badge className="text-blue-300 transition-colors bg-blue-500/30 hover:bg-blue-500/50">NFT</Badge>
                <span className="text-xs text-gray-400">Token ID: #1234</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <DialogHeader className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                    <Badge variant="outline" className="mr-1 border-blue-500/30 bg-blue-500/10">
                      {asset.symbol.toUpperCase()}
                    </Badge>
                    {asset.name}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-gray-400">
                    {asset.price.toFixed(2)} ETH • {asset.currencypair} • NFT
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="text-white transition-all bg-blue-600 hover:bg-blue-500 hover:shadow-glow-blue"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Tabs Component */}
            <Tabs defaultValue="description" className="mt-2">
  <TabsList className="grid w-full grid-cols-3 bg-[#1a2b4b]/50 p-1">
    <TabsTrigger
      value="description"
      className="capitalize data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 hover:text-blue-300 transition-all"
    >
      Description
    </TabsTrigger>
    <TabsTrigger
      value="owner"
      className="capitalize data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 hover:text-blue-300 transition-all"
    >
      Owner
    </TabsTrigger>
    <TabsTrigger
      value="metadata"
      className="capitalize data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 hover:text-blue-300 transition-all"
    >
      Metadata
    </TabsTrigger>
  </TabsList>

  <TabsContent
    value="description"
    className="p-4 mt-4 rounded-md bg-[#1a2b4b]/20 border border-blue-500/20 hover:border-blue-500/30 transition-colors"
  >
    <div className="flex items-start gap-3">
      <FileText className="w-5 h-5 mt-1 text-blue-400" />
      <div>
        <h3 className="mb-2 font-medium">About {asset.name}</h3>
        <p className="text-sm leading-relaxed text-gray-300">
          This NFT token represents ownership of digital assets on the blockchain. It follows the ERC-721
          standard and provides verifiable ownership and transfer capabilities.
        </p>
      </div>
    </div>
  </TabsContent>

  <TabsContent
    value="owner"
    className="p-4 mt-4 rounded-md bg-[#1a2b4b]/20 border border-blue-500/20 hover:border-blue-500/30 transition-colors"
  >
    <div className="flex items-start gap-3">
      <User className="w-5 h-5 mt-1 text-blue-400" />
      <div>
        <h3 className="mb-2 font-medium">Owner Details</h3>
        <p className="text-sm leading-relaxed text-gray-300">
          The current owner of this NFT is 0x7Fc9...3E4b.
        </p>
      </div>
    </div>
  </TabsContent>

  <TabsContent
    value="metadata"
    className="p-4 mt-4 rounded-md bg-[#1a2b4b]/20 border border-blue-500/20 hover:border-blue-500/30 transition-colors"
  >
    <div className="flex items-start gap-3">
      <FileText className="w-5 h-5 mt-1 text-blue-400" />
      <div>
        <h3 className="mb-2 font-medium">Metadata</h3>
        <p className="text-sm leading-relaxed text-gray-300">
          Token ID: #1234, Standard: ERC-721, Created: 2025-01-15.
        </p>
      </div>
    </div>
  </TabsContent>

  

            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}