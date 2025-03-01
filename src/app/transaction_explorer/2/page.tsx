"use client";
import React, { useState } from "react";
import { fetchTransactions } from "@/src/pages/api/fetchTransaction";
import SearchBar from "@/src/components/transactionexplorer/searchbar";
import TransactionList from "@/src/components/transactionexplorer/transactionlist";
import Pagination from "@/src/components/transactionexplorer/pagnition";
import TransactionNetwork from "@/src/components/transactionexplorer/transactionetwork2";
import { Transaction } from "@/src/components/transactionexplorer/type";

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
  const [loadedPages, setLoadedPages] = useState<number[]>([]);

  const handleSearch = async (addressToSearch: string = address) => {
    if (!addressToSearch) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTransactions(addressToSearch, "initial");
      const extractedTransactions = data.length > 0 ? data[0].transactions : [];
      console.log(extractedTransactions);
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

  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress);
    // Reset pagination and search with the new address
    setTransactionsByPage({});
    setLastIndex(null);
    setCurrentPage(1);
    setLoadedPages([]);
    handleSearch(newAddress);
  };

  const hasLoadedTransactions = Object.keys(transactionsByPage).length > 0;
  const maxPage = Math.max(...loadedPages, 0);
  const currentTransactions = transactionsByPage[currentPage] || [];

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h2 className="mb-4 text-xl font-bold">Transaction Explorer</h2>

      <SearchBar
        address={address}
        setAddress={setAddress}
        handleSearch={() => handleSearch()}
        loading={loading}
        error={error}
      />

      {hasLoadedTransactions && (
        <>
          {/* Add the TransactionNetwork component */}
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold">Transaction Network</h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              Click on "Explore" under any node to make it the center of the
              network.
            </p>
            <TransactionNetwork
              transactions={currentTransactions}
              address={address}
              onAddressChange={handleAddressChange}
            />
          </div>

          <h3 className="mb-2 text-lg font-semibold">Transaction List</h3>
          <TransactionList
            transactions={currentTransactions}
            currentPage={currentPage}
          />

          <Pagination
            currentPage={currentPage}
            maxPage={maxPage}
            navigateToPage={navigateToPage}
            loadMore={loadMore}
            hasMore={hasMore}
            loading={loading}
          />
        </>
      )}
    </div>
  );
};

export default TransactionExplorer;
