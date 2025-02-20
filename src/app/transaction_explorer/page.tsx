"use client";
import React, { useState } from "react";
import { fetchTransactions } from "@/src/pages/api/fetchTransaction";

interface Transaction {
  transaction_id: string;
  transaction_fee: number;
  gas_price: number;
  gas_used: number;
  value: number;
  block_timestamp: number;
  receiver: string;
}

const TransactionExplorer: React.FC = () => {
  const [address, setAddress] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hop, setHop] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!address) return;
    const formattedAddress = address.trim().toLowerCase(); // Ensure consistent format
    console.log(formattedAddress);
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTransactions(formattedAddress, hop);
      console.log("Fetched Transactions:", data); // ✅ Debugging
      // If data is an array with nested transactions, extract them
      const extractedTransactions = data.length > 0 ? data[0].transactions : [];
      setTransactions(extractedTransactions);
    } catch (err) {
      setError("Failed to fetch transactions.");
    }
    setLoading(false);
  };

  const loadMore = async () => {
    setLoading(true);
    setError(null);
    try {
      const nextHop = hop + 1;
      const newData = await fetchTransactions(address, nextHop);
      setHop(nextHop);
      setTransactions(newData);
    } catch (err) {
      setError("Failed to load more transactions.");
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">Transaction Explorer</h2>
      <input
        type="text"
        placeholder="Enter Address ID"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="mb-2 w-full rounded border p-2"
      />
      <button
        onClick={handleSearch}
        className="rounded bg-blue-500 px-4 py-2 text-white"
        disabled={loading}
      >
        {loading ? "Loading..." : "Search"}
      </button>
      {error && <p className="mt-2 text-red-500">{error}</p>}
      <h3 className="mt-4 text-lg font-semibold">Transactions</h3>

      <ul className="list-disc pl-5">
        {transactions.length === 0 ? (
          <p>No transactions found</p>
        ) : (
          transactions.map((t, index) => (
            <li key={index} className="mb-2">
              <strong>Receiver:</strong> {t.receiver} <br />
              <strong>Transaction ID:</strong> {t.transaction_id} <br />
              <strong>Value:</strong> {t.value} <br />
              <strong>Fee:</strong> {t.transaction_fee} <br />
              <strong>Gas Used:</strong> {t.gas_used} <br />
              {/* <strong>Block Timestamp:</strong> {t.block_timestamp} <br /> */}
              {/* {new Date(t.block_timestamp).toLocaleString()} <br /> */}
            </li>
          ))
        )}
      </ul>
      {transactions.length > 0 && (
        <button
          onClick={loadMore}
          className="mt-4 rounded bg-green-500 px-4 py-2 text-white"
          disabled={loading}
        >
          {loading ? "Loading..." : `Load More (Hop ${hop + 1})`}
        </button>
      )}
    </div>
  );
};
export default TransactionExplorer;
