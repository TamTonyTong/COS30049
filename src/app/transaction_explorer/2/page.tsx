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
}

const TestTransactionExplorer: React.FC = () => {
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastIndex, setLastIndex] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [transactionsByPage, setTransactionsByPage] = useState<{
    [page: number]: Transaction[];
  }>({});
  const handleSearch = async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTransactions(address, "initial");
      const extractedTransactions = data.length > 0 ? data[0].transactions : [];
      console.log("Extracted", data);
      if (extractedTransactions.length > 0) {
        setTransactionsByPage({ 1: extractedTransactions });
        setLastIndex(
          extractedTransactions[extractedTransactions.length - 1]
            .transaction_index,
        );
        //   setCurrentPage(1);
        //   setLoadedPages([1]);
        setHasMore(extractedTransactions.length >= 4);
      } else {
        //   setTransactionsByPage({});
        //   setLoadedPages([]);
        setHasMore(false);
      }
    } catch (err) {
      setError("Failed to fetch transactions.");
    }
    setLoading(false);
  };
  const allTransactions = Object.values(transactionsByPage).flat();

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Transaction Explorer</h2>
      <div className="mb-4">
        <p className="mb-2 text-sm text-gray-500">
          Example: 0xb0606f433496bf66338b8ad6b6d51fc4d84a44cd
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
        <TransactionNetwork transactions={allTransactions} address={address} />
      </div>
    </div>
  );
};

export default TestTransactionExplorer;
