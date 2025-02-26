"use client";
import React, { useState } from "react";
import { fetchTransactions } from "@/src/pages/api/fetchTransaction";

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
}

const TransactionExplorer: React.FC = () => {
  const [address, setAddress] = useState<string>("");
  const [transactionsByPage, setTransactionsByPage] = useState<{
    [page: number]: Transaction[];
  }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastIndex, setLastIndex] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadedPages, setLoadedPages] = useState<number[]>([]);

  const handleSearch = async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTransactions(address, "initial");
      const extractedTransactions = data.length > 0 ? data[0].transactions : [];

      if (extractedTransactions.length > 0) {
        setTransactionsByPage({ 1: extractedTransactions });
        setLastIndex(
          extractedTransactions[extractedTransactions.length - 1]
            .transaction_index,
        );
        setCurrentPage(1);
        setLoadedPages([1]);
        setHasMore(extractedTransactions.length >= 4);
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
        setHasMore(extractedTransactions.length >= 4);
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

  const hasLoadedTransactions = Object.keys(transactionsByPage).length > 0;

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">Transaction Explorer</h2>
      <p>0xb0606f433496bf66338b8ad6b6d51fc4d84a44cd</p>
      <input
        type="text"
        placeholder="Enter Address ID"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="mb-2 w-full rounded border bg-transparent p-2"
      />
      <button
        onClick={handleSearch}
        className="rounded bg-blue-500 px-4 py-2 text-white"
        disabled={loading}
      >
        {loading ? "Loading..." : "Search"}
      </button>
      {error && <p className="mt-2 text-red-500">{error}</p>}

      {hasLoadedTransactions && (
        <>
          <h3 className="mt-4 text-lg font-semibold">
            Transactions (Page {currentPage})
          </h3>
          <ul className="list-disc pl-5">
            {transactionsByPage[currentPage]?.map((t, index) => (
              <li key={index} className="mb-2">
                {/* <strong>Receiver:</strong> {t.receiver} <br />
                <strong>Hash:</strong> {t.hash} <br /> */}
                <strong>Transaction ID:</strong> {t.transaction_index} <br />
                {/* <strong>Value:</strong> {t.value} <br />
              <strong>Fee:</strong> {t.transaction_fee} <br />
              <strong>Gas Used:</strong> {t.gas_used} <br />
              <strong>Gas Price:</strong> {t.gas_price} <br />
              <strong>Gas:</strong> {t.gas} <br /> */}
                {/* <strong>Input:</strong> {t.input} <br /> */}
                {/* <strong>Input:</strong> Hiding, display if fixed <br />
              <strong>Block Number:</strong> {t.block_number} <br />
              <strong>Block Hash:</strong> {t.block_hash} <br /> */}
                <strong>Block Timestamp:</strong>{" "}
                {new Date(t.block_timestamp * 1000).toLocaleString()} <br />
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-between">
            {/* Navigation Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => navigateToPage(currentPage - 1)}
                className={`rounded px-4 py-2 text-white ${
                  currentPage > 1
                    ? "bg-gray-500"
                    : "cursor-not-allowed bg-gray-300"
                }`}
                disabled={currentPage <= 1}
              >
                Previous Page
              </button>

              {loadedPages.length > 0 && (
                <div className="flex items-center gap-2 px-2">
                  {/* Show page numbers */}
                  <span className="text-sm">
                    Page {currentPage} of {Math.max(...loadedPages)}
                  </span>
                </div>
              )}

              <button
                onClick={() => navigateToPage(currentPage + 1)}
                className={`rounded px-4 py-2 text-white ${
                  currentPage < Math.max(...loadedPages)
                    ? "bg-gray-500"
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
                className="rounded bg-green-500 px-4 py-2 text-white disabled:bg-green-300"
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionExplorer;
