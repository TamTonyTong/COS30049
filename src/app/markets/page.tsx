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
import { Button } from "@/src/components/ui/button"; // Import Button component
import Link from "next/link"; // Import Link component
import Layout from "../../components/layout";

export default function MarketsPage() {
  interface Asset {
    symbol: string;
    name: string;
    price: number;
    currencypair: string;
    assettype: string;
    volume: number;
  }

  const [assets, setAssets] = useState<Asset[]>([]);
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
        setAssets(data.assets);
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

  if (assets.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-blue-500/30 bg-[#1a2b4b]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                No Assets Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">No assets are available.</p>
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
              <CardTitle className="text-2xl font-bold text-white">
                Digital Asset Markets
              </CardTitle>
              <Link href="/trade"> {/* Link to the trading page */}
                <Button variant="outline" className="text-white">
                  Trade
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Asset</TableHead>
                    <TableHead className="text-right text-white">
                      Price
                    </TableHead>
                    <TableHead className="text-right text-white">
                      Currency Pair
                    </TableHead>
                    <TableHead className="text-right text-white">
                      Asset Type
                    </TableHead>
                    <TableHead className="text-right text-white">
                      Volume
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow
                      key={asset.symbol}
                      className="transition-colors hover:bg-[#0d1829]"
                    >
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {asset.symbol.toUpperCase()}
                          </Badge>
                          {asset.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-white">
                        ${asset.price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-white">
                        {asset.currencypair}
                      </TableCell>
                      <TableCell className="text-right text-white">
                        {asset.assettype}
                      </TableCell>
                      <TableCell className="text-right text-white">
                        {asset.volume.toLocaleString()}
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