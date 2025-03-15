"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/src/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { ExternalLink, User, FileText, Heart, Share2 } from "lucide-react"
import Image from "next/image"

interface Asset {
  assetid: string;
  symbol: string;
  name: string;
  price: number;
  currencypair: string;
  assettype: string;
  creatorid: string | null; // Changed from userid to creatorid, allowing null
  createdat: string | null;
  img?: string; // Added from the first version to support optional image URL
}

interface AssetDetailModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AssetDetailModal({ asset, isOpen, onClose }: AssetDetailModalProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [imageStatus, setImageStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [creatorMetawallet, setCreatorMetawallet] = useState<string>("Loading...")
  const [ownerMetawallet, setOwnerMetawallet] = useState<string>("Loading...")

  // Reset states and fetch image/details when modal opens with a new asset
  useEffect(() => {
    const fetchImage = async () => {
      if (!asset) return
      setImageError(false)
      setImageLoaded(false)
      try {
        // Check if image exists in storage
        const { data: listData } = await supabase.storage
          .from('nft-img')
          .list(`nfts/${asset.symbol}`)

        if (listData && listData.length > 0) {
          const { data: urlData } = await supabase.storage
            .from('nft-img')
            .getPublicUrl(`nfts/${asset.symbol}/` + listData[0].name)
          setImageUrl(urlData.publicUrl)
        } else {
          setImageError(true)
        }
      } catch (error) {
        console.error('Error fetching image:', error)
        setImageError(true)
      }
    }

    console.log("useEffect triggered - isOpen:", isOpen, "asset:", asset);
    if (isOpen && asset) {
      setImageLoaded(false);
      setCreatorMetawallet("Loading...");
      setOwnerMetawallet("Loading...");
      console.log("Asset passed to modal:", asset);
      fetchImage();
      fetchAssetDetails();
    }
  }, [isOpen, asset]);

  const fetchAssetDetails = async () => {
    console.log("fetchAssetDetails called with asset:", asset);
    if (!asset) {
      console.log("No asset provided, exiting fetchAssetDetails");
      return;
    }
  
    try {
      console.log("Checking creatorid:", asset.creatorid);
      if (!asset.creatorid || asset.creatorid === null) {
        console.warn("CreatorID is null or undefined, skipping creator fetch:", asset);
        setCreatorMetawallet("Unknown");
      } else {
        console.log("Fetching creator with creatorid:", asset.creatorid);
        const { data: creatorData, error: creatorError } = await supabase
          .from("User")
          .select("metawallet")
          .eq("userid", asset.creatorid)
          .single();
  
        if (creatorError) {
          console.error("Creator fetch error:", creatorError);
          throw new Error(`Failed to fetch creator: ${creatorError.message}`);
        }
        console.log("Creator data received:", creatorData);
        console.log("Setting creatorMetawallet:", creatorData?.metawallet || "Unknown");
        setCreatorMetawallet(creatorData?.metawallet || "Unknown");
      }
  
      console.log("Checking assetid:", asset.assetid);
      if (!asset.assetid) {
        console.error("Asset assetid is undefined:", asset);
        setOwnerMetawallet("Not owned");
      } else {
        console.log("Fetching wallet with assetid:", asset.assetid);
        const { data: walletData, error: walletError } = await supabase
          .from("Wallet")
          .select("userid")
          .eq("assetid", asset.assetid)
          .limit(1);
  
        const walletUserId = walletData && walletData.length > 0 ? walletData[0].userid : null;
        if (walletError || !walletUserId) {
          console.warn("Wallet fetch error or no owner found:", walletError);
          setOwnerMetawallet("Not owned");
        } else {
          console.log("Fetching owner with userid:", walletUserId);
          const { data: ownerData, error: ownerError } = await supabase
            .from("User")
            .select("metawallet")
            .eq("userid", walletUserId)
            .single();
  
          if (ownerError) {
            console.error("Owner fetch error:", ownerError);
            throw new Error(`Failed to fetch owner: ${ownerError.message}`);
          }
          console.log("Owner data received:", ownerData);
          console.log("Setting ownerMetawallet:", ownerData?.metawallet || "Unknown");
          setOwnerMetawallet(ownerData?.metawallet || "Unknown");
        }
      }
    } catch (error) {
      console.error("Error fetching asset details:", error instanceof Error ? error.message : JSON.stringify(error));
      setCreatorMetawallet("Error");
      setOwnerMetawallet("Error");
    }
  };

  const handleImageLoaded = () => {
    setImageStatus('success');
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageStatus('error');
    setImageError(true);
  };

  if (!asset) return null;

  // Format the createdat timestamp
  const createdTimestamp = asset.createdat
    ? (() => {
        try {
          return new Date(asset.createdat).toLocaleDateString();
        } catch (e) {
          console.error("Invalid createdat format:", asset.createdat);
          return "Unknown";
        }
      })()
    : "Unknown";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] p-0 bg-[#0d1829] border-blue-500/30 text-white overflow-hidden">
        <div className="relative">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-indigo-900/20 to-purple-900/20 animate-gradient-slow"></div>

          {/* NFT Image Display with loading animation */}
          <div className="relative w-full h-[300px] sm:h-[350px] overflow-hidden group">
            {/* Shimmer loading effect */}
            {imageStatus === 'loading' && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d1829] via-[#1a2b4b] to-[#0d1829] bg-[length:400%_100%] animate-shimmer"></div>
            )}

            {imageUrl || asset.img ? (
              <Image
                src={imageUrl || asset.img || "/placeholder.svg"}
                alt={`${asset.name} NFT`}
                fill
                className={`object-contain p-4 transition-all duration-700 ${imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                onLoadingComplete={handleImageLoaded}
                onError={handleImageError}
                unoptimized // Prevent Next.js image optimization
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-500">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4" />
                  <p>No image available</p>
                </div>
              </div>
            )}

            {/* Hover effect glow */}
            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10"></div>

            {/* Top action buttons */}
            <div className="absolute flex gap-2 transition-opacity duration-300 opacity-0 top-4 right-4 group-hover:opacity-100">
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 rounded-full bg-[#1a2b4b]/80 hover:bg-blue-500/30 hover:text-blue-300 hover:shadow-glow transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
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
                    {asset.price.toFixed(2)} ETH • {asset.currencypair} • {asset.assettype}
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                 
                </div>
              </div>
            </DialogHeader>

            {/* Tabs Component */}
            <Tabs defaultValue="description" className="mt-2">
              <TabsList className="grid w-full grid-cols-4 bg-[#1a2b4b]/50 p-1">
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
                  value="mint"
                  className="capitalize data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 hover:text-blue-300 transition-all"
                >
                  Mint
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
                      The current owner of this NFT is {ownerMetawallet}.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="mint"
                className="p-4 mt-4 rounded-md bg-[#1a2b4b]/20 border border-blue-500/20 hover:border-blue-500/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 mt-1 text-blue-400" />
                  <div>
                    <h3 className="mb-2 font-medium">Mint Details</h3>
                    <p className="text-sm leading-relaxed text-gray-300">
                      The creator of this NFT is {creatorMetawallet}.
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
                      Created: {createdTimestamp}.
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