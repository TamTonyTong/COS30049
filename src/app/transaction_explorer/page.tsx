"use client";
import React, { useEffect, useState } from "react";
import Layout from "@/src/components/layout";
import { fetchTransactions } from "@/src/pages/api/fetchTransaction";
import { fetchInfuraTransactions } from "@/src/pages/api/infuraapi";
import SearchBar from "@/src/components/transactionexplorer/searchbar";
import TransactionList from "@/src/components/transactionexplorer/transactionlist";
import Pagination from "@/src/components/transactionexplorer/pagnition";
import TransactionNetwork from "@/src/components/transactionexplorer/transactionetwork";
import BlockRangeSelector from "@/src/components/transactionexplorer/blockselector";
import { Transaction } from "@/src/components/transactionexplorer/type";
import {
  syncInfuraData,
  getInfuraPageFromDb,
  getTransactionByHash,
} from "@/src/pages/api/infura-sync";
import { fetchTransactionByHash } from "@/src/pages/api/fetchTransaction";
import TransactionChart from "@/src/components/transactionexplorer/transactionchart";
import TopTransactionsChart from "@/src/components/transactionexplorer/top10transaction";
import WalletOverview from "@/src/components/transactionexplorer/walletoverview";
// Import icons
import {
  Activity,
  Database,
  BarChart3,
  Cloud,
  Layers,
  Coins,
} from "lucide-react";
const TransactionExplorer: React.FC = () => {
  const [address, setAddress] = useState<string>("");
  const [transactionsByPage, setTransactionsByPage] = useState<{
    [page: number]: Transaction[];
  }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastIndex, setLastIndex] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadedPages, setLoadedPages] = useState<number[]>([]);
  const [isTransactionHash, setIsTransactionHash] = useState<boolean>(false);
  // Add state for expanded transactions
  const [expandedNodes, setExpandedNodes] = useState<{
    [address: string]: Transaction[];
  }>({});
  // Keep blockchain type selection
  const [blockchainType, setBlockchainType] = useState<"ETH" | "SWC">("ETH");
  // Add block range state for ETH
  const [blockRange, setBlockRange] = useState<number>(30);
  // Add view mode state to toggle between visualization and analytics

  // Replace ETH modes with a single Infura mode
  const [ethDataSource, setEthDataSource] = useState<"infura">("infura");
  const [forceFresh, setForceFresh] = useState<boolean>(false);
  // Add this function to be passed to TransactionNetwork
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const [allHistoricalTransactions, setAllHistoricalTransactions] = useState<
    Transaction[]
  >([]);
  // Add an effect to update allHistoricalTransactions whenever transactionsByPage changes
  useEffect(() => {
    const allTxs = Object.values(transactionsByPage).flat();
    setAllHistoricalTransactions((prev) => {
      // Combine existing transactions with new ones, avoiding duplicates
      const uniqueTxMap = new Map<string, Transaction>();

      // Add previous transactions to the map
      prev.forEach((tx) => {
        if (tx.hash) {
          uniqueTxMap.set(tx.hash, tx);
        }
      });

      // Add new transactions, replacing duplicates if any
      allTxs.forEach((tx) => {
        if (tx.hash) {
          uniqueTxMap.set(tx.hash, tx);
        }
      });

      return Array.from(uniqueTxMap.values());
    });
  }, [transactionsByPage]);
  const handleNodeExpansion = async (
    address: string,
    transactions: Transaction[],
  ) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [address]: transactions,
    }));
    // Add expanded transactions to the historical collection
    setAllHistoricalTransactions((prev) => {
      const uniqueTxMap = new Map<string, Transaction>();

      // Add previous transactions to the map
      prev.forEach((tx) => {
        if (tx.hash) {
          uniqueTxMap.set(tx.hash, tx);
        }
      });

      // Add new expanded transactions
      transactions.forEach((tx) => {
        if (tx.hash) {
          uniqueTxMap.set(tx.hash, tx);
        }
      });

      return Array.from(uniqueTxMap.values());
    });
  };

  const handleSearch = async (addressToSearch: string = address) => {
    if (!addressToSearch) return;
    setLoading(true);
    setError(null);
    setExpandedNodes({}); // Reset expanded nodes
    setTransactionsByPage({}); // Clear existing transactions
    setLastIndex(undefined);
    setCurrentPage(1);
    setLoadedPages([]);
    setHasMore(false);
    setAllHistoricalTransactions([]); // Reset historical transactions on new search
    try {
      let extractedTransactions: Transaction[] = [];
      if (isTransactionHash) {
        // Search by transaction hash
        let transaction;

        // Try both sources based on blockchain type
        if (blockchainType === "ETH") {
          // Try Infura first
          transaction = await getTransactionByHash(addressToSearch);
        } else {
          // SWC - use internal database
          transaction = await fetchTransactionByHash(addressToSearch);
        }

        if (transaction) {
          // If transaction found, display it
          extractedTransactions = [transaction];

          // If we found a transaction, change the address to the sender address
          // for proper context in the visualization
          setAddress(transaction.sender || transaction.from_address);
        } else {
          setError("Transaction not found.");
        }
      } else {
        if (blockchainType === "SWC") {
          // SWC still uses internal database
          const data = await fetchTransactions(addressToSearch, "initial");
          extractedTransactions = data.length > 0 ? data[0].transactions : [];
        } else {
          // ETH now uses Infura with the forceFresh parameter
          extractedTransactions = await syncInfuraData(
            addressToSearch,
            forceFresh, // Force fresh data instead of using blockRange
            blockRange,
            true,
          );
        }
      }
      if (extractedTransactions.length > 0) {
        setTransactionsByPage({ 1: extractedTransactions });
        setLastIndex(
          extractedTransactions.length > 0
            ? Number(extractedTransactions.at(-1)?.transaction_index) ||
                undefined
            : undefined,
        );
        setCurrentPage(1);
        setLoadedPages([1]);
        setHasMore(extractedTransactions.length >= 8); // Adjust based on page size
        setAllHistoricalTransactions(extractedTransactions);
      } else {
        setTransactionsByPage({});
        setLoadedPages([]);
        setHasMore(false);
      }
    } catch (err) {
      setError("Failed to fetch transactions.");
      console.error(err);
    }

    setLoading(false);
  };

  const loadMore = async () => {
    if (blockchainType === "SWC" && !lastIndex) return;
    setLoading(true);
    setError(null);

    try {
      let extractedTransactions: Transaction[] = [];
      const nextPage = currentPage + 1;

      if (blockchainType === "SWC") {
        // SWC still uses internal database for pagination
        const newData = await fetchTransactions(
          address,
          "older",
          lastIndex !== undefined ? lastIndex.toString() : undefined,
        );
        extractedTransactions =
          newData.length > 0 ? newData[0].transactions : [];
      } else {
        // ETH now always uses Infura for pagination
        extractedTransactions = await getInfuraPageFromDb(address, nextPage);
      }

      if (extractedTransactions.length > 0) {
        setTransactionsByPage((prev) => ({
          ...prev,
          [nextPage]: extractedTransactions,
        }));

        if (blockchainType === "SWC") {
          setLastIndex(
            extractedTransactions.length > 0
              ? Number(extractedTransactions.at(-1)?.transaction_index) ||
                  undefined
              : undefined,
          );
        }
        setCurrentPage(nextPage);
        setLoadedPages((prev) => [...prev, nextPage]);
        setHasMore(extractedTransactions.length >= 8);
        setAllHistoricalTransactions(extractedTransactions);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError("Failed to load more transactions.");
      console.error(err);
    }

    setLoading(false);
  };

  // Keep other functions the same
  const navigateToPage = (page: number) => {
    if (page >= 1 && page <= Math.max(...loadedPages, 0)) {
      setCurrentPage(page);
    }
  };

  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress);
    // Reset pagination and search with the new address
    resetState();
    handleSearch(newAddress);
  };

  const handleResetView = () => {
    // Reset expanded nodes
    setExpandedNodes({});

    // Keep only the initial transactions for the current address
    // This ensures we go back to just showing the first page
  };

  // Helper function to reset state
  const resetState = () => {
    setTransactionsByPage({});
    setLastIndex(undefined);
    setCurrentPage(1);
    setLoadedPages([]);
    setIsTransactionHash(false); // Reset to address search when changing blockchain
    setExpandedNodes({}); // Also reset expanded nodes
    setAllHistoricalTransactions([]); // Reset historical transactions
  };

  // Simplified selector
  const selectBlockchainType = (type: "ETH" | "SWC") => {
    setBlockchainType(type);
    resetState();
  };

  const hasLoadedTransactions = Object.keys(transactionsByPage).length > 0;
  const maxPage = Math.max(...loadedPages, 0);
  const currentTransactions = transactionsByPage[currentPage] || [];
  const expandedTransactions = Object.values(expandedNodes).flat();

  // Use a Map with transaction hash as key to remove duplicates
  const uniqueTransactions = new Map();

  // Add current transactions first
  currentTransactions.forEach((tx) => {
    uniqueTransactions.set(tx.hash, tx);
  });

  // Then add expanded transactions, replacing any duplicates
  expandedTransactions.forEach((tx) => {
    uniqueTransactions.set(tx.hash, tx);
  });

  const allTransactions = Array.from(uniqueTransactions.values());
  console.log(
    allHistoricalTransactions.length,
    "allTransactions from time to time",
  );
  return (
    <Layout>
      <div className="mx-auto max-w-6xl p-4">
        {/* Centered title with icon */}
        <div className="mb-8 flex justify-center">
          <h1 className="flex items-center gap-3 text-center text-3xl font-bold">
            <Activity className="h-8 w-8 text-blue-500" />
            <span>Transaction Explorer</span>
          </h1>
        </div>

        {/* Blockchain selector with icons */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3 flex items-center">
            <Coins className="mr-2 h-5 w-5 text-blue-500" />
            <span className="text-lg font-semibold">Blockchain Network</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => selectBlockchainType("ETH")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                blockchainType === "ETH"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 256 417"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid"
              >
                <path
                  fill={blockchainType === "ETH" ? "#fff" : "#343434"}
                  d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"
                />
                <path
                  fill={blockchainType === "ETH" ? "#fff" : "#8C8C8C"}
                  d="M127.962 0L0 212.32l127.962 75.639V154.158z"
                />
                <path
                  fill={blockchainType === "ETH" ? "#fff" : "#3C3C3B"}
                  d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"
                />
                <path
                  fill={blockchainType === "ETH" ? "#fff" : "#8C8C8C"}
                  d="M127.962 416.905v-104.72L0 236.585z"
                />
                <path
                  fill={blockchainType === "ETH" ? "#fff" : "#141414"}
                  d="M127.961 287.958l127.96-75.637-127.96-58.162z"
                />
                <path
                  fill={blockchainType === "ETH" ? "#fff" : "#393939"}
                  d="M0 212.32l127.96 75.638v-133.8z"
                />
              </svg>
              Ethereum (ETH)
            </button>
            <button
              onClick={() => selectBlockchainType("SWC")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                blockchainType === "SWC"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <Layers
                className={`h-5 w-5 ${blockchainType === "SWC" ? "text-white" : "text-gray-700"}`}
              />
              Swinburne (SWC)
            </button>
          </div>

          {/* ETH data source with Infura icon */}
          {blockchainType === "ETH" && (
            <div className="mt-4 flex items-center">
              <Cloud className="mr-2 h-4 w-4 text-blue-400" />
              <span className="mr-2 text-sm font-medium">Data Source:</span>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white">
                  <Database className="h-4 w-4" />
                  Infura API
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Block range selector for ETH only */}
        {blockchainType === "ETH" && !isTransactionHash && (
          <BlockRangeSelector
            blockRange={blockRange}
            setBlockRange={setBlockRange}
          />
        )}

        {/* Search section */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3 flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
            <span className="text-lg font-semibold">Search Transactions</span>
          </div>

          <SearchBar
            address={address}
            setAddress={setAddress}
            handleSearch={() => handleSearch()}
            loading={loading}
            error={error}
            isTransactionHash={isTransactionHash}
            setIsTransactionHash={setIsTransactionHash}
          />

          {blockchainType === "ETH" && (
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="forceFresh"
                checked={forceFresh}
                onChange={(e) => setForceFresh(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="forceFresh" className="text-sm">
                Force fresh data from Infura
                {forceFresh && (
                  <span className="ml-2 text-yellow-500">
                    (May take longer to load)
                  </span>
                )}
              </label>
            </div>
          )}
        </div>
        {/* Add wallet overview when transactions are loaded */}
        {hasLoadedTransactions &&
          !isTransactionHash &&
          blockchainType === "ETH" && (
            <WalletOverview
              address={address}
              transactions={allHistoricalTransactions}
              blockchainType={blockchainType}
            />
          )}

        {/* Transaction Network Visualization */}
        <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Activity className="h-5 w-5 text-blue-500" />
              Transaction Network
            </h3>
          </div>

          <div className="relative grid grid-cols-7 md:flex-row">
            <div className="col-span-7">
              <TransactionNetwork
                transactions={currentTransactions}
                address={address}
                onAddressChange={handleAddressChange}
                blockchainType={blockchainType}
                onNodeExpanded={handleNodeExpansion}
                expandedNodes={expandedNodes}
                onResetView={handleResetView}
              />
            </div>
          </div>
        </div>
        {hasLoadedTransactions && blockchainType === "ETH" && (
          <div className="mb-6">
            <div className="mb-4">
              <span className="mr-2 text-sm font-medium">Time Range:</span>
              <div className="flex flex-wrap gap-2">
                {(["24h", "7d", "30d"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`rounded-md px-4 py-2 text-sm font-medium ${
                      timeRange === range
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {range === "24h"
                      ? "Last 24 Hours"
                      : range === "7d"
                        ? "Last Week"
                        : "Last Month"}
                  </button>
                ))}
              </div>
            </div>
            <TransactionChart
              transactions={allHistoricalTransactions}
              timeRange={timeRange}
            />
          </div>
        )}
        {hasLoadedTransactions && (
          <div className="mb-6">
            <TopTransactionsChart transactions={allHistoricalTransactions} />
          </div>
        )}
        {/* Transaction List */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Database className="h-5 w-5 text-blue-500" />
              Transactions
            </h3>
          </div>
          <div className="p-4">
            <TransactionList
              transactions={allTransactions}
              address={address}
              blockchainType={blockchainType}
            />
            <Pagination
              currentPage={currentPage}
              maxPage={maxPage}
              navigateToPage={navigateToPage}
              loadMore={loadMore}
              hasMore={hasMore}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TransactionExplorer;
