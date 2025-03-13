"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Search, X } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Layout from "../../components/layout";

export default function TradePage() {
  interface Trade {
    tradeid: string;
    symbol: string;
    name: string;
    assettype: string;
    price: number;
    status: "Buy" | "Sold";
    userid: string;
    metawallet: string;
    pricehistoryid: string;
    walletid: string;
  }
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetch("/api/trade")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setTrades(data.trades);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Error fetching data");
        setIsLoading(false);
      });
  }, []);

  const filteredTrades = trades.filter((trade) => {
    return (
      trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (isLoading) return <div>Loading...</div>;

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-red-500/30 bg-[#1a2b4b]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (trades.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-blue-500/30 bg-[#1a2b4b]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">No Trades Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">No trades are available.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card className="border-blue-500/30 bg-[#1a2b4b]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-white">Markets</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-blue-500/10 blur-md"></div>
                <div className="relative flex items-center bg-[#0d1829]/90 rounded-lg overflow-hidden border border-blue-500/30">
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
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border rounded-md border-blue-500/20">
              <Table>
                <TableHeader className="bg-[#0d1829]/70">
                  <TableRow>
                    <TableHead className="text-white">Symbol</TableHead>
                    <TableHead className="text-white">Name</TableHead>
                    <TableHead className="text-white">Asset Type</TableHead>
                    <TableHead className="text-right text-white">Price (ETH)</TableHead>
                    <TableHead className="text-right text-white">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-gray-400">
                        No trades found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTrades.map((trade) => (
                      <TableRow key={trade.tradeid} className="transition-colors hover:bg-[#0d1829]">
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2">
                              {trade.symbol.toUpperCase()}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-white">{trade.name}</TableCell>
                        <TableCell className="text-white">{trade.assettype}</TableCell>
                        <TableCell className="text-right text-white">
                          {trade.price.toFixed(2)} ETH
                        </TableCell>
                        <TableCell className="text-right align-middle">
                          {trade.status === "Sold" ? (
                            <Badge variant="secondary" className="bg-gray-200 text-black px-2 py-1 rounded">
                              Sold
                            </Badge>
                          ) : (
                            <Button
                              onClick={() =>
                                router.push(
                                  `/markets/buy?tradeid=${trade.tradeid}&userid=${trade.userid}&metawallet=${trade.metawallet}&pricehistoryid=${trade.pricehistoryid}&price=${trade.price}&walletid=${trade.walletid}`
                                )
                              }
                              variant="outline"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Buy
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}