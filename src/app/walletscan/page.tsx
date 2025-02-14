"use client"; // Required for client-side rendering in Next.js

import Link from "next/link";
import Layout from "@/src/components/layout";
import "dotenv/config";
import axios from "axios";
import { useEffect, useState } from "react";
import Graph from "@/src/components/walletscan/graph"; // Import the Graph component
import TransactionTable from "@/src/components/transactiontable";
import AddressInput from "@/src/components/walletscan/address_input";
import BalanceDisplay from "@/src/components/walletscan/balance_display";

const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
const BASE_URL = "https://api.etherscan.io/api";
const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price";

// Utility function to shorten address
const shortenAddress = (address: string): string => {
  return `${address.slice(0, 2)}...${address.slice(-4)}`;
};

export default function WalletScan() {
  const [address, setAddress] = useState(""); // Store user input
  const [balance, setBalance] = useState<string | null>(null); // Store fetched balance
  const [usdValue, setUsdValue] = useState<string | null>(null); // USD Balance
  const [ethPrice, setEthPrice] = useState<number | null>(null); // ETH/USD Price
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState<{
    nodes: { id: string; label: string }[];
    edges: { from: string; to: string; label?: string }[];
  }>({ nodes: [], edges: [] }); // State for graph data
  const [transactions, setTransactions] = useState<
    {
      hash: string;
      from: string;
      to: string;
      value: string;
      blockNumber: string;
      timestamp: string;
      status: string;
    }[]
  >([]);


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
        setBalance(balanceInEth_string);
      }

      

      // Fetch transactions
      const transactions = await fetchTransactions(address);
      setTransactions(transactions); // Store transactions in state

      // Update graph data
      const nodes = new Set<string>();
      const edges = transactions.map((tx: any) => {
        nodes.add(tx.from);
        nodes.add(tx.to);
        return { from: tx.from, to: tx.to, label: `${tx.value} ETH` };
      });

      setGraphData({
        nodes: Array.from(nodes).map((id) => ({
          id,
          label: shortenAddress(id),
        })),
        edges: edges,
      });
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    }
    setLoading(false);
  };

  const ETHERSCAN_URL = "https://api.etherscan.io/api";

  const fetchTransactions = async (address: string) => {
    try {
      const response = await axios.get(ETHERSCAN_URL, {
        params: {
          module: "account",
          action: "txlist",
          address: address,
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: 6,
          sort: "desc",
          apikey: ETHERSCAN_API_KEY,
        },
      });

      if (response.data.status === "1") {
        const transactions = response.data.result;
        return transactions.map((tx: any) => ({
          hash: tx.hash, // Transaction hash
          from: tx.from,
          to: tx.to, // Shortened Recipient address
          value: (Number(tx.value) / 1e18).toFixed(4), // Convert Wei to ETH
          blockNumber: tx.blockNumber, // Block number
          timestamp: new Date(tx.timeStamp * 1000).toLocaleString(), // Convert timestamp to readable format
          status: tx.isError === "0" ? "Success" : "Failed", // Transaction status
        }));
      } else {
        console.error("Error fetching transactions:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  };

  
  const handleNodeClick = async (nodeId: string) => {
    setLoading(true);
    try {
      const transactions = await fetchTransactions(nodeId);

      const newNodes = new Set<string>([
        ...graphData.nodes.map((node) => node.id),
      ]);
      const newEdges = [...graphData.edges];

      transactions.forEach((tx: { from: any; to: any; label?: string | undefined; }) => {
        newNodes.add(tx.from);
        newNodes.add(tx.to);
        newEdges.push(tx);
      });

      setGraphData({
        nodes: Array.from(newNodes).map((id) => ({
          id,
          label: shortenAddress(id),
        })),
        edges: newEdges,
      });
    } catch (error) {
      console.error("Error fetching additional transactions:", error);
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
      <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl text-center">
          Scanning Wallet
        </h1>
      <div className="flex flex-col mb-24 text-center items-left">
        <p className="text-xs">0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5</p>
        <Link
          href="https://etherscan.io/address/0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5"
          target="_blank"
        >
          <p>Validation</p>
        </Link>
        <AddressInput
        address={address}
        setAddress={setAddress}
        loading={loading}
        fetchBalance={fetchBalance}
      />
      <BalanceDisplay balance={balance} usdValue={usdValue} />
        {/* Render the Graph component */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Transaction Graph</h2>
          <Graph
            nodes={graphData.nodes}
            edges={graphData.edges}
            onNodeClick={handleNodeClick} // Pass the callback function
          />
        </div>
        <TransactionTable transactions={transactions} />
      </div>
    </Layout>
  );
}
