"use client"; // Required for client-side rendering in Next.js

import { Search } from "lucide-react";
import Link from "next/link";
import Layout from "../components/layout";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import "dotenv/config";
import axios from "axios";
import { useEffect, useState } from "react";

const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
const BASE_URL = "https://api.etherscan.io/api";
const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price";

export default function WalletScan() {
  const [address, setAddress] = useState(""); // Store user input
  const [balance, setBalance] = useState<string | null>(null); // Store fetched balance
  const [usdValue, setUsdValue] = useState<string | null>(null); // USD Balance
  const [ethPrice, setEthPrice] = useState<number | null>(null); // ETH/USD Price
  const [loading, setLoading] = useState(false);

  // Fetch ETH/USD price from CoinGecko
  const fetchEthPrice = async () => {
    try {
      const response = await axios.get(COINGECKO_API_URL, {
        params: {
          ids: "ethereum",
          vs_currencies: "usd",
        },
      });

      const price = response.data.ethereum.usd;
      setEthPrice(price);
    } catch (error) {
      console.error("Error fetching ETH price:", error);
    }
  };

  // Fetch balance from Etherscan API
  const fetchBalance = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          module: "account",
          action: "balance",
          address: address,
          tag: "latest",
          apikey: ETHERSCAN_API_KEY,
        },
      });

      const balanceInWei = response.data.result;
      const balanceInEth = Number(balanceInWei) / 1e18; // Convert Wei to ETH
      const balanceInEth_string = (Number(balanceInWei) / 1e18).toFixed(5);

      // Convert ETH to USD if price is available
      if (ethPrice) {
        const balanceInUsd = balanceInEth * ethPrice;
        setUsdValue(balanceInUsd.toFixed(0)); // Keep 2 decimal places
      }

      setBalance(balanceInEth_string);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    }
    setLoading(false);
  };

  // Fetch ETH price on component mount
  useEffect(() => {
    fetchEthPrice();
  }, []);
  console.log(ethPrice);
  console.log(usdValue);
  return (
    <Layout>
      <div className="flex flex-col items-left text-center mb-24">
        <p className="text-xs">0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5</p>
        <Link
          href="https://etherscan.io/address/0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5"
          target="_blank"
        >
          <p>Validation</p>
        </Link>
        <div className="relative w-full max-w-2xl mb-16">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
          <p>Example Address</p>
          <div className="relative flex items-center justify-end bg-[#1a2b4b]/80 rounded-full overflow-hidden border border-blue-500/30">
            <Input
              type="text"
              placeholder="Search by Address"
              className="border-0 bg-transparent text-xl text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 ml-2 h-fit"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <Button
              className="bg-transparent hover:bg-inherit"
              onClick={fetchBalance}
              disabled={loading}
            >
              {loading ? (
                "Loading..."
              ) : (
                <Search className="w-5 h-5 text-blue-400 mr-4" />
              )}
            </Button>
          </div>

          {balance !== null && (
            <p className="mt-4 text-lg text-white">
              Balance: <span className="text-blue-400">{balance} ETH</span>
            </p>
          )}

          {usdValue !== null && (
            <p className="mt-4 text-lg text-white">
              USD Value: <span className="text-green-400">${usdValue} USD</span>
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
