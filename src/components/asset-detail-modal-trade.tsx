"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Badge } from "@/src/components/ui/badge";
import { Zap, CheckCircle, FileText, User, Clock, Tag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

interface Trade {
  tradeid: string;
  symbol: string;
  name: string;
  img?: string;
  assettype: string;
  price: number;
  status: "Buy" | "Sold";
  userid: string;
  metawallet: string;
  pricehistoryid: string;
  walletid: string;
  txid: string | null;
  description?: string;
  createdat?: string;
  owner?: string;
  creator?: string;
  creatorid?: string;
  creatorMetawallet?: string;
}

interface AssetDetailModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AssetDetailModal({ trade, isOpen, onClose }: AssetDetailModalProps) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHoveringBuy, setIsHoveringBuy] = useState(false);
  const [creatorMetawallet, setCreatorMetawallet] = useState<string>("Unknown");
  const [ownerMetawallet, setOwnerMetawallet] = useState<string>("Unknown");

  // Fetch creator metawallet
  const fetchCreatorMetawallet = async () => {
    if (!trade || !trade.creatorid) {
      setCreatorMetawallet("Unknown");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("User")
        .select("metawallet")
        .eq("userid", trade.creatorid)
        .single();

      if (error || !data) {
        console.warn("Error or no data fetching creator metawallet:", error?.message);
        setCreatorMetawallet("Unknown");
        return;
      }

      setCreatorMetawallet(data.metawallet || "Unknown");
    } catch (err) {
      console.error("Unexpected error fetching creator metawallet:", err);
      setCreatorMetawallet("Unknown");
    }
  };

  const fetchOwner = async () => {
    if (!trade?.walletid) {
      setOwnerMetawallet("Unknown");
      return;
    }
    try {
      // First get the Wallet record
      const { data: walletData, error: walletError } = await supabase
        .from('Wallet')
        .select('userid')
        .eq('walletid', trade.walletid)
        .single();

      if (walletError || !walletData) {
        console.warn('Error fetching wallet:', walletError?.message);
        setOwnerMetawallet("Unknown");
        return;
      }

      // Then get the User's metawallet
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('metawallet')
        .eq('userid', walletData.userid)
        .single();

      if (userError || !userData) {
        console.warn('Error fetching owner user:', userError?.message);
        setOwnerMetawallet("Unknown");
        return;
      }

      setOwnerMetawallet(userData.metawallet || "Unknown");
    } catch (err) {
      console.error('Error fetching owner:', err);
      setOwnerMetawallet("Unknown");
    }
  };

  useEffect(() => {
    if (isOpen && trade) {
      setImageLoaded(false);
      console.log("Trade object received by modal:", trade); // Debug log
      // If creatorMetawallet is available from the API, use it; otherwise, fetch it
      if (trade.creatorMetawallet) {
        setCreatorMetawallet(trade.creatorMetawallet);
      } else {
        fetchCreatorMetawallet();
      }
      // Fetch owner if not available in trade data
      if (trade.owner) {
        setOwnerMetawallet(trade.owner);
      } else {
        fetchOwner();
      }
    }
  }, [isOpen, trade]);

  const handleBuyClick = () => {
    if (!trade) return;

    const loggedInUserId = localStorage.getItem("userid");
    if (localStorage.getItem("isLoggedIn") === "false") {
      router.push("/login");
    } else if (loggedInUserId && loggedInUserId === trade.userid) {
      alert("You can't buy the asset that you sell.");
    } else {
      router.push(
        `/markets/buy?tradeid=${trade.tradeid}&userid=${trade.userid}&metawallet=${trade.metawallet}&pricehistoryid=${trade.pricehistoryid}&price=${trade.price}&walletid=${trade.walletid}`,
      );
      onClose(); // Close the modal after navigation
    }
  };

  if (!trade) return null;

  // Determine if the trade is available for purchase
  const isAvailable = trade.status === "Buy";

  // Format the createdat timestamp if available
  const createdTimestamp = trade.createdat
    ? (() => {
      console.log("Raw createdat:", trade.createdat);
      console.log("Type of createdat:", typeof trade.createdat);
      try {
        const date = new Date(trade.createdat!);
        console.log("Parsed Date:", date);
        return date.toLocaleString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      } catch (e) {
        console.error("Error parsing date:", e);
        return "Unknown";
      }
    })()
    : "Unknown";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-[#0d1829] border-blue-500/30 text-white overflow-hidden">
        <div className="relative">
          {/* NFT Image Display with animation */}
          <motion.div
            className="relative w-full h-[200px] overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d1829] via-[#1a2b4b] to-[#0d1829] bg-[length:400%_100%] animate-shimmer"></div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: imageLoaded ? 1 : 0,
                scale: imageLoaded ? 1 : 0.95,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative w-full h-full"
            >
              <Image
                src={trade.img || "/placeholder.svg"}
                alt={`${trade.name}`}
                fill
                className="object-contain p-2"
                onLoadingComplete={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
                unoptimized
              />
            </motion.div>

            {/* Image hover effect */}
            <motion.div
              className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 hover:opacity-100"
              whileHover={{ opacity: 1 }}
            />
          </motion.div>

          <div className="p-4">
            <DialogHeader className="mb-2">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Badge variant="outline" className="mr-1 border-blue-500/30 bg-blue-500/10">
                  {trade.symbol.toUpperCase()}
                </Badge>
                {trade.name}
              </DialogTitle>
            </DialogHeader>

            {/* Asset Info */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div className="text-gray-400">Asset Type:</div>
              <div className="text-right text-white">{trade.assettype || "NFT"}</div>

              <div className="text-gray-400">Price:</div>
              <div className="font-bold text-right text-white">{trade.price.toFixed(2)} ETH</div>

              <div className="text-gray-400">Status:</div>
              <div className="text-right">
                {isAvailable ? (
                  <Badge className="text-green-400 bg-green-500/20">Available</Badge>
                ) : (
                  <Badge className="text-gray-400 bg-gray-500/20">Sold</Badge>
                )}
              </div>
            </div>

            {/* Tabs Component */}
            <Tabs defaultValue="description" className="mt-2 mb-4">
              <TabsList className="grid w-full grid-cols-4 bg-[#1a2b4b]/50 p-0.5 h-8">
                <TabsTrigger
                  value="description"
                  className="text-xs capitalize data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 hover:text-blue-300 transition-all"
                >
                  Desc
                </TabsTrigger>
                <TabsTrigger
                  value="owner"
                  className="text-xs capitalize data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 hover:text-blue-300 transition-all"
                >
                  Owner
                </TabsTrigger>
                <TabsTrigger
                  value="mint"
                  className="text-xs capitalize data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 hover:text-blue-300 transition-all"
                >
                  Mint
                </TabsTrigger>
                <TabsTrigger
                  value="metadata"
                  className="text-xs capitalize data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 hover:text-blue-300 transition-all"
                >
                  Metadata
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="description"
                className="p-2 mt-2 rounded-md bg-[#1a2b4b]/20 border border-blue-500/20 text-xs"
              >
                <motion.div
                  className="flex items-start gap-2"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FileText className="w-4 h-4 mt-0.5 text-blue-400 shrink-0" />
                  <div>
                    <p className="leading-relaxed text-gray-300">
                      {trade.description ||
                        `This ${trade.assettype || "NFT"} token represents ownership of digital assets on the blockchain. It follows the ERC-721 standard and provides verifiable ownership and transfer capabilities.`}
                    </p>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent
                value="owner"
                className="p-2 mt-2 rounded-md bg-[#1a2b4b]/20 border border-blue-500/20 text-xs"
              >
                <motion.div
                  className="flex items-start gap-2"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <User className="w-4 h-4 mt-0.5 text-blue-400 shrink-0" />
                  <div>
                    <p className="leading-relaxed text-gray-300">
                      The current owner of this asset is {ownerMetawallet}.
                    </p>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent
                value="mint"
                className="p-2 mt-2 rounded-md bg-[#1a2b4b]/20 border border-blue-500/20 text-xs"
              >
                <motion.div
                  className="flex items-start gap-2"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <User className="w-4 h-4 mt-0.5 text-blue-400 shrink-0" />
                  <div>
                    <p className="leading-relaxed text-gray-300">
                      The creator of this asset is {creatorMetawallet}.
                    </p>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent
                value="metadata"
                className="p-2 mt-2 rounded-md bg-[#1a2b4b]/20 border border-blue-500/20 text-xs"
              >
                <motion.div
                  className="space-y-1.5"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between">
                    <div className="flex items-center text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      Created
                    </div>
                    <div className="text-white">{createdTimestamp}</div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center text-gray-400">
                      <Tag className="w-3 h-3 mr-1" />
                      ID
                    </div>
                    <div className="text-white">{trade.tradeid.substring(0, 8)}...</div>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>

            {/* Buy Now Button */}
            {isAvailable ? (
              <motion.button
                onClick={handleBuyClick}
                onMouseEnter={() => setIsHoveringBuy(true)}
                onMouseLeave={() => setIsHoveringBuy(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={
                  isAvailable
                    ? {
                      boxShadow: [
                        "0 0 0 rgba(59, 130, 246, 0)",
                        "0 0 10px rgba(59, 130, 246, 0.3)",
                        "0 0 0 rgba(59, 130, 246, 0)",
                      ],
                    }
                    : {}
                }
                transition={
                  isAvailable
                    ? {
                      boxShadow: { repeat: Number.POSITIVE_INFINITY, duration: 2 },
                      scale: { duration: 0.2 },
                    }
                    : {}
                }
                className="relative w-full py-2 overflow-hidden font-medium text-white transition-all duration-300 rounded-lg shadow-lg group bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 hover:shadow-blue-500/40"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Zap className={`h-4 w-4 transition-all duration-300 ${isHoveringBuy ? "rotate-12" : ""}`} />
                  Buy Now for {trade.price.toFixed(2)} ETH
                </span>
                <span className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 group-hover:opacity-100"></span>
              </motion.button>
            ) : (
              <div className="w-full py-2 text-center text-gray-300 rounded-lg bg-gray-700/50">
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Already Sold
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}