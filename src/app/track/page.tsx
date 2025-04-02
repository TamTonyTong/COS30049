'use client';

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TrackTransactions() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState<string>(""); // State for the search input
  const [transactions, setTransactions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle search button click
  const handleSearch = async () => {
    if (!searchInput) {
      setError("Please enter a wallet address to search.");
      return;
    }

    // Basic validation for Ethereum wallet address (42 characters, starts with 0x)
    if (!/^0x[a-fA-F0-9]{40}$/.test(searchInput)) {
      setError("Please enter a valid Ethereum wallet address (e.g., 0x followed by 40 hexadecimal characters).");
      return;
    }

    setWalletAddress(searchInput.toLowerCase());
    setError(null); // Clear any previous errors
    await fetchTransactions(searchInput.toLowerCase());
  };

  const fetchTransactions = async (address: string) => {
    setLoading(true);
    try {
      // Step 1: Find the userid associated with the wallet address
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("userid")
        .ilike("metawallet", address);

      if (userError) {
        throw new Error(`Failed to find user: ${userError.message}`);
      }
      if (!userData || userData.length === 0) {
        setTransactions([]);
        setError("No user found with this wallet address. Please register your wallet.");
        return;
      }
      if (userData.length > 1) {
        throw new Error("Multiple users found with this wallet address. Please contact support.");
      }

      const userId = userData[0].userid;

      // Step 2: Fetch all transactions and their paired transactions in a single query
      const { data: transactionsData, error: txError } = await supabase
        .rpc("get_user_transactions_with_counterparty", {
          p_userid: userId,
        });

      if (txError) {
        throw new Error(`Failed to fetch transactions: ${txError.message}`);
      }

      if (!transactionsData || transactionsData.length === 0) {
        setTransactions([]);
        return;
      }

      setTransactions(transactionsData);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred while fetching transactions.");
      } else {
        setError(String(err) || "An error occurred while fetching transactions.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Track Transactions</h1>

      {/* Search Input and Button */}
      <div className="mb-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Enter wallet address (e.g., 0x...)"
          className="border p-2 rounded w-full md:w-1/2 mr-2 text-black"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2 md:mt-0"
        >
          Search
        </button>
      </div>

      {/* Display the searched wallet address */}
      {walletAddress && (
        <div>
          <p className="mb-4">
            Searched Wallet: <span className="font-mono">{walletAddress}</span>
          </p>

          {loading ? (
            <p>Loading transactions...</p>
          ) : transactions.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold mb-2">Transaction History</h2>
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
                  {transactions.map((tx) => (
                    <tr key={tx.txid} className="border">
                      <td className="border p-2">{tx.txid}</td>
                      <td className="border p-2">
                        {tx.asset_name ? `${tx.asset_name} (${tx.asset_symbol})` : "Unknown"}
                      </td>
                      <td className="border p-2">{tx.type}</td>
                      <td className="border p-2 font-mono">
                        {tx.counterparty_wallet || "Unknown"}
                      </td>
                      <td className="border p-2">{tx.amount}</td>
                      <td className="border p-2">{new Date(tx.tx_timestamp).toLocaleString()}</td>
                      <td className="border p-2">{tx.status || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No transactions found for this wallet.</p>
          )}
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}