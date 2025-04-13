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
// Import supabase client for local blockchain tracking
import { supabase } from "@/lib/supabaseClient";
// Import icons
import {
  Activity,
  Database,
  BarChart3,
  Cloud,
  Layers,
  Coins,
  HardDrive,
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
  const [expandedNodes, setExpandedNodes] = useState<{
    [address: string]: Transaction[];
  }>({});
  const [blockchainType, setBlockchainType] = useState<"ETH" | "SWC" | "LOCAL">(
    "ETH",
  );
  const [blockRange, setBlockRange] = useState<number>(30);
  const [ethDataSource, setEthDataSource] = useState<"infura">("infura");
  const [forceFresh, setForceFresh] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const [allHistoricalTransactions, setAllHistoricalTransactions] = useState<
    Transaction[]
  >([]);
  const [localTransactions, setLocalTransactions] = useState<any[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const allTxs = Object.values(transactionsByPage).flat();
    setAllHistoricalTransactions((prev) => {
      const uniqueTxMap = new Map<string, Transaction>();
      prev.forEach((tx) => {
        if (tx.hash) {
          uniqueTxMap.set(tx.hash, tx);
        }
      });
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
    setAllHistoricalTransactions((prev) => {
      const uniqueTxMap = new Map<string, Transaction>();
      prev.forEach((tx) => {
        if (tx.hash) {
          uniqueTxMap.set(tx.hash, tx);
        }
      });
      transactions.forEach((tx) => {
        if (tx.hash) {
          uniqueTxMap.set(tx.hash, tx);
        }
      });
      return Array.from(uniqueTxMap.values());
    });
  };

  const fetchLocalTransactions = async (walletAddress: string) => {
    setLoading(true);
    setLocalError(null);

    try {
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("userid")
        .ilike("metawallet", walletAddress);

      if (userError) {
        throw new Error(`Failed to find user: ${userError.message}`);
      }

      if (!userData || userData.length === 0) {
        setLocalTransactions([]);
        setLocalError(
          "No user found with this wallet address. Please register your wallet.",
        );
        setLoading(false);
        return;
      }

      if (userData.length > 1) {
        throw new Error(
          "Multiple users found with this wallet address. Please contact support.",
        );
      }

      const userId = userData[0].userid;

      const { data: transactionsData, error: txError } = await supabase.rpc(
        "get_user_transactions_with_counterparty",
        {
          p_userid: userId,
        },
      );

      if (txError) {
        throw new Error(`Failed to fetch transactions: ${txError.message}`);
      }

      setLocalTransactions(transactionsData || []);
    } catch (err) {
      if (err instanceof Error) {
        setLocalError(
          err.message || "An error occurred while fetching transactions.",
        );
      } else {
        setLocalError(
          String(err) || "An error occurred while fetching transactions.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (addressToSearch: string = address) => {
    if (!addressToSearch) return;
    setLoading(true);
    setError(null);
    setExpandedNodes({});
    setTransactionsByPage({});
    setLastIndex(undefined);
    setCurrentPage(1);
    setLoadedPages([]);
    setHasMore(false);
    setAllHistoricalTransactions([]);

    if (blockchainType === "LOCAL") {
      await fetchLocalTransactions(addressToSearch);
      setLoading(false);
      return;
    }

    try {
      let extractedTransactions: Transaction[] = [];
      if (isTransactionHash) {
        let transaction;
        if (blockchainType === "ETH") {
          transaction = await getTransactionByHash(addressToSearch);
        } else {
          transaction = await fetchTransactionByHash(addressToSearch);
        }

        if (transaction) {
          extractedTransactions = [transaction];
          setAddress(transaction.sender || transaction.from_address);
        } else {
          setError("Transaction not found.");
        }
      } else {
        if (blockchainType === "SWC") {
          const data = await fetchTransactions(addressToSearch, "initial");
          extractedTransactions = data.length > 0 ? data[0].transactions : [];
        } else {
          extractedTransactions = await syncInfuraData(
            addressToSearch,
            forceFresh,
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
        setHasMore(extractedTransactions.length >= 8);
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
        const newData = await fetchTransactions(
          address,
          "older",
          lastIndex !== undefined ? lastIndex.toString() : undefined,
        );
        extractedTransactions =
          newData.length > 0 ? newData[0].transactions : [];
      } else {
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

  const navigateToPage = (page: number) => {
    if (page >= 1 && page <= Math.max(...loadedPages, 0)) {
      setCurrentPage(page);
    }
  };

  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress);
    resetState();
    handleSearch(newAddress);
  };

  const handleResetView = () => {
    setExpandedNodes({});
  };

  const resetState = () => {
    setTransactionsByPage({});
    setLastIndex(undefined);
    setCurrentPage(1);
    setLoadedPages([]);
    setIsTransactionHash(false);
    setExpandedNodes({});
    setAllHistoricalTransactions([]);
    setLocalTransactions([]);
    setLocalError(null);
  };

  const selectBlockchainType = (type: "ETH" | "SWC" | "LOCAL") => {
    setBlockchainType(type);
    resetState();
  };

  const hasLoadedTransactions = Object.keys(transactionsByPage).length > 0;
  const maxPage = Math.max(...loadedPages, 0);
  const currentTransactions = transactionsByPage[currentPage] || [];
  const expandedTransactions = Object.values(expandedNodes).flat();

  const uniqueTransactions = new Map();
  currentTransactions.forEach((tx) => {
    uniqueTransactions.set(tx.hash, tx);
  });
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
        <div className="mb-8 flex justify-center">
          <h1 className="flex items-center gap-3 text-center text-3xl font-bold">
            <Activity className="h-8 w-8 text-blue-500" />
            <span>Transaction Explorer</span>
          </h1>
        </div>

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
            <button
              onClick={() => selectBlockchainType("LOCAL")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                blockchainType === "LOCAL"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <HardDrive
                className={`h-5 w-5 ${blockchainType === "LOCAL" ? "text-white" : "text-gray-700"}`}
              />
              Local Blockchain
            </button>
          </div>

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

          {blockchainType === "LOCAL" && (
            <div className="mt-4 flex items-center">
              <Database className="mr-2 h-4 w-4 text-blue-400" />
              <span className="mr-2 text-sm font-medium">Data Source:</span>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white">
                  <HardDrive className="h-4 w-4" />
                  Local Database (Supabase)
                </div>
              </div>
            </div>
          )}
        </div>

        {blockchainType === "ETH" && !isTransactionHash && (
          <BlockRangeSelector
            blockRange={blockRange}
            setBlockRange={setBlockRange}
          />
        )}

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

        {blockchainType === "LOCAL" && localTransactions.length > 0 && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Database className="h-5 w-5 text-blue-500" />
                Local Blockchain Transactions
              </h3>
            </div>
            <div className="p-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="border p-2">Transaction ID</th>
                    <th className="border p-2">Asset</th>
                    <th className="border p-2">Type</th>
                    <th className="border p-2">Counterparty Wallet</th>
                    <th className="border p-2">Amount (ETH)</th>
                    <th className="border p-2">Timestamp</th>
                    <th className="border p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {localTransactions.map((tx) => (
                    <tr key={tx.txid} className="border">
                      <td className="border p-2">{tx.txid}</td>
                      <td className="border p-2">
                        {tx.asset_name
                          ? `${tx.asset_name} (${tx.asset_symbol})`
                          : "Unknown"}
                      </td>
                      <td className="border p-2">{tx.type}</td>
                      <td className="border p-2 font-mono">
                        {tx.counterparty_wallet || "Unknown"}
                      </td>
                      <td className="border p-2">{tx.amount}</td>
                      <td className="border p-2">
                        {new Date(tx.tx_timestamp).toLocaleString()}
                      </td>
                      <td className="border p-2">{tx.status || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {blockchainType === "LOCAL" && localError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 shadow">
            <p>{localError}</p>
          </div>
        )}

        {hasLoadedTransactions &&
          !isTransactionHash &&
          blockchainType === "ETH" && (
            <WalletOverview
              address={address}
              transactions={allHistoricalTransactions}
              blockchainType={blockchainType}
            />
          )}

        {blockchainType !== "LOCAL" && (
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
        )}

        {blockchainType !== "LOCAL" &&
          hasLoadedTransactions &&
          blockchainType === "ETH" && (
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

        {blockchainType !== "LOCAL" && hasLoadedTransactions && (
          <div className="mb-6">
            <TopTransactionsChart transactions={allHistoricalTransactions} />
          </div>
        )}

        {blockchainType !== "LOCAL" && (
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
        )}
      </div>
    </Layout>
  );
};

export default TransactionExplorer;
