"use client";

import { useState, useEffect } from "react";
import { Input } from "@/src/components/ui/input";
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
import { ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import Layout from "../../components/layout";

export default function MarketsPage() {
  interface DigitalAsset {
    AssetID: string;
    name: string;
    shortname: string;
    value: number;
    change: number;
    volume: number;
    marketCap: number;
  }

  const [digitalAssets, setDigitalAssets] = useState<DigitalAsset[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data from the API route
    fetch("/api/assets")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setDigitalAssets(data.assets);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Error fetching data")
        setIsLoading(false);
      });
  }, []);

  const filteredAssets = digitalAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.shortname.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name or symbol..."
                className="w-full rounded-md border-gray-700 bg-[#0d1829] py-2 pl-10 pr-4 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
                  {filteredAssets.map((asset) => (
                    <TableRow
                      key={asset.AssetID}
                      className="transition-colors hover:bg-[#0d1829]"
                    >
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {asset.shortname}
                          </Badge>
                          {asset.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-white">
                        ${asset.value.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`flex items-center justify-end ${
                            asset.change >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {asset.change >= 0 ? (
                            <ArrowUpRight className="mr-1" size={16} />
                          ) : (
                            <ArrowDownRight className="mr-1" size={16} />
                          )}
                          {Math.abs(asset.change)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-gray-300">
                        {asset.volume}
                      </TableCell>
                      <TableCell className="text-right text-gray-300">
                        {asset.marketCap}
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
