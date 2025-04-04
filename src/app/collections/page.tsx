"use client"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import Layout from "@/src/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { RefreshCw, Sparkles } from "lucide-react"
import Link from "next/link"
import NFTCollectionGrid from "@/src/components/nft-collection-grid"
import { useState } from "react"

export default function CollectionsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Wait for a short time to simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
    window.location.reload()
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
                NFT Collections
              </CardTitle>
              <div className="flex items-center gap-3">
                <Link href="/">
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
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <NFTCollectionGrid />
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

