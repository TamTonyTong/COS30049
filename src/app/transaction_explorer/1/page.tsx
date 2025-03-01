"use client";
import React, { useState } from "react";
import { fetchTransactions } from "@/src/pages/api/fetchTransaction";
import TransactionNetwork from "@/src/components/transactionexplorer/transactionetwork";

interface Transaction {
  hash: string;
  value: number;
  input: number;
  gas: number;
  gas_used: number;
  gas_price: number;
  transaction_fee: number;
  block_number: number;
  transaction_index: string;
  block_hash: string;
  block_timestamp: number;
  receiver: string;
  sender?: string; // For incoming transactions
  direction: "incoming" | "outgoing"; // Add direction property
}

const IntegratedTransactionExplorer: React.FC = () => {
  const [address, setAddress] = useState<string>("");
  const [transactionsByPage, setTransactionsByPage] = useState<{
    [page: number]: Transaction[];
  }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastIndex, setLastIndex] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadedPages, setLoadedPages] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "network">("list");

  const handleSearch = async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTransactions(address, "initial");
      const extractedTransactions = data.length > 0 ? data[0].transactions : [];
      console.log("Extracted Data,", extractedTransactions);
      if (extractedTransactions.length > 0) {
        setTransactionsByPage({ 1: extractedTransactions });
        setLastIndex(
          extractedTransactions[extractedTransactions.length - 1]
            .transaction_index,
        );
        setCurrentPage(1);
        setLoadedPages([1]);
        setHasMore(extractedTransactions.length >= 8);
      } else {
        setTransactionsByPage({});
        setLoadedPages([]);
        setHasMore(false);
      }
    } catch (err) {
      setError("Failed to fetch transactions.");
    }
    setLoading(false);
  };

  const loadMore = async () => {
    if (!lastIndex) return;
    setLoading(true);
    setError(null);
    try {
      const newData = await fetchTransactions(address, "older", lastIndex);
      const extractedTransactions =
        newData.length > 0 ? newData[0].transactions : [];

      if (extractedTransactions.length > 0) {
        const nextPage = currentPage + 1;
        setTransactionsByPage((prev) => ({
          ...prev,
          [nextPage]: extractedTransactions,
        }));
        setLastIndex(
          extractedTransactions[extractedTransactions.length - 1]
            .transaction_index,
        );
        setCurrentPage(nextPage);
        setLoadedPages((prev) => [...prev, nextPage]);
        setHasMore(extractedTransactions.length >= 8);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError("Failed to load more transactions.");
    }
    setLoading(false);
  };

  const navigateToPage = (page: number) => {
    if (page >= 1 && page <= Math.max(...loadedPages, 0)) {
      setCurrentPage(page);
    }
  };

  // Get only the transactions for the current page instead of all transactions
  const currentPageTransactions = transactionsByPage[currentPage] || [];
  console.log("Current Page Transactions", currentPageTransactions);
  console.log("Has More or not", hasMore);
  const hasLoadedTransactions = Object.keys(transactionsByPage).length > 0;

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">Transaction Explorer</h2>
      <div className="mb-4">
        <p className="mb-2 text-sm text-gray-500">
          Example: 0x3089df0e2349faea1c8ec4a08593c137da10fe2d
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter Address ID"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-grow rounded border bg-transparent p-2"
          />
          <button
            onClick={handleSearch}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>
      </div>

      {error && <p className="mt-2 text-red-500">{error}</p>}

      {hasLoadedTransactions && (
        <div className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Transactions for {address.substring(0, 6)}...
              {address.substring(address.length - 4)}
            </h3>
            {/* <div className="flex gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`rounded px-3 py-1 text-sm ${
                  viewMode === "list"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode("network")}
                className={`rounded px-3 py-1 text-sm ${
                  viewMode === "network"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Network View
              </button>
            </div> */}
          </div>

          <>
            <div className="flex rounded-lg border bg-black dark:bg-gray-800">
              <TransactionNetwork
                transactions={currentPageTransactions}
                address={address}
              />
              <table className="w-full rounded-lg bg-black">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      ID
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Receiver
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Value
                    </th>
                    <th className="text-middle px-2 py-3 text-xs font-medium uppercase text-gray-500">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-gray-200">
                  {transactionsByPage[currentPage]?.map((t, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-900">
                        {t.transaction_index}
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-500">
                        {t.receiver.substring(0, 6)}...
                        {t.receiver.substring(t.receiver.length - 4)}
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-500">
                        {(t.value / 1e18).toFixed(4)} ETH
                      </td>
                      <td className="py-4 text-sm text-gray-500">
                        {new Date(t.block_timestamp * 1000).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-between">
              {/* Navigation Controls */}
              <div className="flex gap-2">
                <button
                  onClick={() => navigateToPage(currentPage - 1)}
                  className={`rounded px-4 py-2 text-white ${
                    currentPage > 1
                      ? "bg-gray-500 hover:bg-gray-600"
                      : "cursor-not-allowed bg-gray-300"
                  }`}
                  disabled={currentPage <= 1}
                >
                  Previous Page
                </button>

                {loadedPages.length > 0 && (
                  <div className="flex items-center gap-2 px-2">
                    <span className="text-sm">
                      Page {currentPage} of {Math.max(...loadedPages)}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => navigateToPage(currentPage + 1)}
                  className={`rounded px-4 py-2 text-white ${
                    currentPage < Math.max(...loadedPages)
                      ? "bg-gray-500 hover:bg-gray-600"
                      : "cursor-not-allowed bg-gray-300"
                  }`}
                  disabled={currentPage >= Math.max(...loadedPages)}
                >
                  Next Page
                </button>
              </div>

              {/* Load More Button */}
              {(hasMore || loading) && (
                <button
                  onClick={loadMore}
                  className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:bg-green-300"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              )}
            </div>
          </>
        </div>
      )}
    </div>
  );
};

export default IntegratedTransactionExplorer;
