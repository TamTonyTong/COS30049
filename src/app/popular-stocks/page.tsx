"use client";

import { useEffect, useState } from "react";
import Layout from "@/src/components/layout";
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
import { ArrowUpIcon, ArrowDownIcon, TrendingUp } from "lucide-react";
import { Skeleton } from "@/src/components/ui/skeleton";

// Mock data (API call simulation)
const stocks = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 150.25,
    change: 2.5,
    volume: "78.9M",
    marketCap: 2.45e12,
  }, // 2.45T as a number
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 2750.8,
    change: -0.3,
    volume: "1.2M",
    marketCap: 1.84e12,
  }, // 1.84T as a number
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 305.15,
    change: 1.2,
    volume: "23.5M",
    marketCap: 2.31e12,
  }, // 2.31T as a number
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 3380.5,
    change: -1.5,
    volume: "3.1M",
    marketCap: 1.71e12,
  }, // 1.71T as a number
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 750.3,
    change: 3.8,
    volume: "21.7M",
    marketCap: 751.8e9,
  }, // 751.8B as a number
  {
    symbol: "FB",
    name: "Meta Platforms Inc.",
    price: 330.2,
    change: -0.7,
    volume: "15.3M",
    marketCap: 927.1e9,
  }, // 927.1B as a number
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 220.75,
    change: 4.2,
    volume: "42.8M",
    marketCap: 551.9e9,
  }, // 551.9B as a number
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    price: 155.9,
    change: 0.5,
    volume: "9.2M",
    marketCap: 466.8e9,
  }, // 466.8B as a number
];

export default function PopularStocks() {
  const [stocksData, setStocksData] = useState<any[]>(stocks);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating an API call delay
    const fetchStocks = async () => {
      try {
        setTimeout(() => {
          setStocksData(stocks);
          setIsLoading(false);
        }, 1500); // simulating network delay
      } catch (error) {
        console.error("Failed to fetch stocks:", error);
      }
    };

    fetchStocks();
  }, []);

  const formatLargeNumber = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"; // trillion
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"; // billion
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"; // million
    return num.toString();
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Card className="rounded-lg border-blue-500/30 bg-[#1a2b4b] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-bold text-white">
              <TrendingUp className="mr-2" /> Popular Stocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-12 w-full rounded-lg bg-gray-700"
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg shadow-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">Symbol</TableHead>
                      <TableHead className="text-white">Name</TableHead>
                      <TableHead className="text-right text-white">
                        Price
                      </TableHead>
                      <TableHead className="text-right text-white">
                        24h Change
                      </TableHead>
                      <TableHead className="text-right text-white">
                        Volume
                      </TableHead>
                      <TableHead className="text-right text-white">
                        Market Cap
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stocksData.map((stock) => (
                      <TableRow
                        key={stock.symbol}
                        className="transition-colors hover:bg-[#0d1829]"
                      >
                        <TableCell className="font-medium text-white">
                          <Badge variant="outline" className="font-bold">
                            {stock.symbol}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {stock.name}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-white">
                          ${stock.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`flex items-center justify-end ${
                              stock.change >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {stock.change >= 0 ? (
                              <ArrowUpIcon className="mr-1" size={16} />
                            ) : (
                              <ArrowDownIcon className="mr-1" size={16} />
                            )}
                            {Math.abs(stock.change).toFixed(2)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-gray-300">
                          {stock.volume}
                        </TableCell>
                        <TableCell className="text-right text-gray-300">
                          {formatLargeNumber(stock.marketCap)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
