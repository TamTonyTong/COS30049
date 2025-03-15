import React, { useEffect, useState } from "react";
import { Transaction } from "./type";
import { ArrowUpRight, ArrowDownLeft, Wallet, RefreshCcw } from "lucide-react";

interface WalletOverviewProps {
  address: string;
  transactions: Transaction[];
  blockchainType: "ETH" | "SWC";
}

const WalletOverview: React.FC<WalletOverviewProps> = ({
  address,
  transactions,
  blockchainType,
}) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;

  // Fetch ETH price from CoinGecko API
  const fetchEthPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
      );
      const data = await response.json();
      setEthPrice(data.ethereum.usd);
    } catch (error) {
      console.error("Error fetching ETH price:", error);
    }
  };

  // Fetch wallet balance for ETH
  const fetchWalletBalance = async () => {
    if (!address || blockchainType !== "ETH") return;

    setIsLoading(true);
    try {
      // Use Etherscan API to get balance
      const response = await fetch(
        `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`,
      );
      const data = await response.json();
      if (data.status === "1") {
        // Convert wei to ETH
        setBalance(Number(data.result) / 1e18);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate transaction statistics
  const {
    totalSent,
    totalReceived,
    totalVolume,
    transactionCount,
    uniqueAddresses,
  } = React.useMemo(() => {
    let sent = 0;
    let received = 0;
    const addressSet = new Set<string>();

    transactions.forEach((tx) => {
      // Check if this wallet is the sender
      const isSender =
        tx.from_address?.toLowerCase() === address.toLowerCase() ||
        tx.sender?.toLowerCase() === address.toLowerCase();

      // Check if this wallet is the receiver
      const isReceiver =
        tx.to_address?.toLowerCase() === address.toLowerCase() ||
        tx.receiver?.toLowerCase() === address.toLowerCase();

      // Get transaction value (convert from wei to ETH for Ethereum)
      const value =
        Number(tx.value || tx.amount || 0) /
        (blockchainType === "ETH" ? 1e18 : 1);

      if (isSender) {
        sent += value;
        // Add recipient to unique addresses
        if (tx.to_address) addressSet.add(tx.to_address);
        if (tx.receiver) addressSet.add(tx.receiver);
      }

      if (isReceiver) {
        received += value;
        // Add sender to unique addresses
        if (tx.from_address) addressSet.add(tx.from_address);
        if (tx.sender) addressSet.add(tx.sender);
      }
    });

    return {
      totalSent: sent,
      totalReceived: received,
      totalVolume: sent + received,
      transactionCount: transactions.length,
      uniqueAddresses: addressSet.size,
    };
  }, [transactions, address]);

  // Fetch data when address changes
  useEffect(() => {
    if (address) {
      fetchWalletBalance();
      fetchEthPrice();
    }
  }, [address, blockchainType]);

  // Format value with currency symbol
  const formatValue = (value: number) => {
    return value.toFixed(4) + ` ${blockchainType}`;
  };

  // Format USD value
  const formatUSD = (ethValue: number) => {
    if (!ethPrice) return "$ --";
    const usdValue = ethValue * ethPrice;

    if (usdValue >= 1000000) {
      return `$${(usdValue / 1000000).toFixed(2)}M`;
    } else if (usdValue >= 1000) {
      return `$${(usdValue / 1000).toFixed(2)}K`;
    } else {
      return `$${usdValue.toFixed(2)}`;
    }
  };

  // If address is a transaction hash, don't show the overview
  if (!address || address.length !== 42) {
    return null;
  }

  return (
    <div className="mb-6 overflow-hidden rounded-lg bg-[hsl(215,25%,15%)] p-4 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Wallet Overview</h3>
        <button
          onClick={() => {
            fetchWalletBalance();
            fetchEthPrice();
          }}
          className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
          disabled={isLoading}
        >
          <RefreshCcw size={14} />
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Address */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-white">
          <Wallet size={16} className="text-blue-400" />
          <span className="text-sm text-gray-400">Address:</span>
          <span className="text-sm font-medium">
            {address.substring(0, 8)}...{address.substring(address.length - 8)}
          </span>
          <a
            href={`https://${blockchainType === "ETH" ? "etherscan.io" : "explorer.swinburne.io"}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 rounded-md bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400 hover:bg-blue-500/30"
          >
            View on {blockchainType === "ETH" ? "Etherscan" : "Explorer"}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Balance */}
        <div className="rounded-lg bg-[hsl(215,25%,18%)] p-4 shadow-inner">
          <div className="mb-1 text-sm text-gray-400">Wallet Balance</div>
          <div className="flex flex-col">
            <div className="text-lg font-semibold text-white">
              {balance !== null ? formatValue(balance) : "Loading..."}
            </div>
            {blockchainType === "ETH" && ethPrice && balance !== null && (
              <div className="text-sm text-green-400">{formatUSD(balance)}</div>
            )}
          </div>
        </div>

        {/* Total Sent */}
        <div className="rounded-lg bg-[hsl(215,25%,18%)] p-4 shadow-inner">
          <div className="mb-1 flex items-center gap-1 text-sm text-gray-400">
            <ArrowUpRight size={14} className="text-red-400" />
            Total Sent
          </div>
          <div className="flex flex-col">
            <div className="text-lg font-semibold text-white">
              {formatValue(totalSent)}
            </div>
            {blockchainType === "ETH" && ethPrice && (
              <div className="text-sm text-red-400">{formatUSD(totalSent)}</div>
            )}
          </div>
        </div>

        {/* Total Received */}
        <div className="rounded-lg bg-[hsl(215,25%,18%)] p-4 shadow-inner">
          <div className="mb-1 flex items-center gap-1 text-sm text-gray-400">
            <ArrowDownLeft size={14} className="text-green-400" />
            Total Received
          </div>
          <div className="flex flex-col">
            <div className="text-lg font-semibold text-white">
              {formatValue(totalReceived)}
            </div>
            {blockchainType === "ETH" && ethPrice && (
              <div className="text-sm text-green-400">
                {formatUSD(totalReceived)}
              </div>
            )}
          </div>
        </div>

        {/* Transaction Stats */}
        <div className="rounded-lg bg-[hsl(215,25%,18%)] p-4 shadow-inner">
          <div className="mb-1 text-sm text-gray-400">Activity</div>
          <div className="flex flex-col">
            <div className="text-lg font-semibold text-white">
              {transactionCount} Tx
            </div>
            <div className="text-sm text-blue-400">
              {uniqueAddresses} unique addresses
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletOverview;
