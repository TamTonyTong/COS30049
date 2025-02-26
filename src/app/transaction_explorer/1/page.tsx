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
  const [lastIndex, setLastIndex] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

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
        setHasMore(extractedTransactions.length >= 4);
      } else {
        setTransactionsByPage({});
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
        setTransactionsByPage((prev) => ({
          ...prev,
          [currentPage + 1]: extractedTransactions,
        }));
        setLastIndex(
          extractedTransactions[extractedTransactions.length - 1]
            .transaction_index,
        );
        setCurrentPage((prev) => prev + 1);
        setHasMore(extractedTransactions.length >= 4);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError("Failed to load more transactions.");
    }
    setLoading(false);
  };

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

      {Object.keys(transactionsByPage).length > 0 && (
        <>
          <h3 className="mt-4 text-lg font-semibold">
            Transactions (Page {currentPage})
          </h3>
          <ul className="list-disc pl-5">
            {transactionsByPage[currentPage]?.map((t, index) => (
              <li key={index} className="mb-2">
                <strong>Transaction ID:</strong> {t.transaction_index} <br />
                <strong>Block Timestamp:</strong>{" "}
                {new Date(t.block_timestamp * 1000).toLocaleString()} <br />
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-between">
            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="rounded bg-gray-500 px-4 py-2 text-white"
              >
                Previous Page
              </button>
            )}
            {hasMore && (
              <button
                onClick={loadMore}
                className="rounded bg-green-500 px-4 py-2 text-white"
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
