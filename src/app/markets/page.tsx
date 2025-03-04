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
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Layout from "../../components/layout";

export default function MarketsPage() {
  interface Price {
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h: number;
    total_volume: number;
    market_cap: number;
  }

  const [prices, setPrices] = useState<Price[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/assets")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setPrices(data.assets); // Use data.assets instead of data.prices
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Error fetching data");
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-red-500/30 bg-[#1a2b4b]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (prices.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-blue-500/30 bg-[#1a2b4b]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                No Prices Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">No prices are available.</p>
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
            <CardTitle className="text-2xl font-bold text-white">
              Digital Asset Markets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Asset</TableHead>
                    <TableHead className="text-right text-white">
                      Price (USD)
                    </TableHead>
                    <TableHead className="text-right text-white">
                      24h Change
                    </TableHead>
                    <TableHead className="text-right text-white">
                      24h Volume
                    </TableHead>
                    <TableHead className="text-right text-white">
                      Market Cap
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prices.map((price) => (
                    <TableRow
                      key={price.symbol}
                      className="transition-colors hover:bg-[#0d1829]"
                    >
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {price.symbol.toUpperCase()}
                          </Badge>
                          {price.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-white">
                        ${price.current_price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`flex items-center justify-end ${
                            price.price_change_percentage_24h >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {price.price_change_percentage_24h >= 0 ? (
                            <ArrowUpRight className="mr-1" size={16} />
                          ) : (
                            <ArrowDownRight className="mr-1" size={16} />
                          )}
                          {Math.abs(price.price_change_percentage_24h).toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-gray-300">
                        {price.total_volume.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-gray-300">
                        {price.market_cap.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}