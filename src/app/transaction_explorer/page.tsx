"use client";
import React, { useState } from "react";
import { fetchTransactions } from "@/src/pages/api/fetchTransaction";
import { fetchInfuraTransactions } from "@/src/pages/api/infuraapi";
import SearchBar from "@/src/components/transactionexplorer/searchbar";
import TransactionList from "@/src/components/transactionexplorer/transactionlist";
import Pagination from "@/src/components/transactionexplorer/pagnition";
import TransactionNetwork from "@/src/components/transactionexplorer/transactionetwork";
import { Transaction } from "@/src/components/transactionexplorer/type";
import {
  syncInfuraData,
  getInfuraPageFromDb,
} from "@/src/pages/api/infura-sync";

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

  // Keep blockchain type selection
  const [blockchainType, setBlockchainType] = useState<"ETH" | "SWC">("ETH");

  // Replace ETH modes with a single Infura mode
  const [ethDataSource, setEthDataSource] = useState<"infura">("infura");

  const handleSearch = async (addressToSearch: string = address) => {
    if (!addressToSearch) return;
    setLoading(true);
    setError(null);

    try {
      let extractedTransactions: Transaction[] = [];

      if (blockchainType === "SWC") {
        // SWC still uses internal database
        const data = await fetchTransactions(addressToSearch, "initial");
        extractedTransactions = data.length > 0 ? data[0].transactions : [];
      } else {
        // ETH now always uses Infura
        extractedTransactions = await syncInfuraData(addressToSearch);
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
        setHasMore(extractedTransactions.length >= 10); // Adjust based on page size
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
        const newData = await fetchTransactions(address, "older", lastIndex);
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
        setHasMore(extractedTransactions.length >= 10);
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

  // Helper function to reset state
  const resetState = () => {
    setTransactionsByPage({});
    setLastIndex(undefined);
    setCurrentPage(1);
    setLoadedPages([]);
  };

  // Simplified selector
  const selectBlockchainType = (type: "ETH" | "SWC") => {
    setBlockchainType(type);
    resetState();
  };

  const hasLoadedTransactions = Object.keys(transactionsByPage).length > 0;
  const maxPage = Math.max(...loadedPages, 0);
  const currentTransactions = transactionsByPage[currentPage] || [];

  return (
    <div className="mx-auto max-w-6xl p-4">
      <h2 className="mb-4 text-xl font-bold">Transaction Explorer</h2>

      {/* Blockchain selector */}
      <div className="mb-4">
        <span className="mr-2 text-sm font-medium">Blockchain:</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => selectBlockchainType("ETH")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              blockchainType === "ETH"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Ethereum (ETH)
          </button>
          <button
            onClick={() => selectBlockchainType("SWC")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              blockchainType === "SWC"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Swinburne (SWC)
          </button>
        </div>
      </div>

      {/* Replace ETH modes with Infura indicator */}
      {blockchainType === "ETH" && (
        <div className="mb-4">
          <span className="mr-2 text-sm font-medium">ETH Data Source:</span>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white">
              Infura API
            </button>
          </div>
        </div>
      )}

      <SearchBar
        address={address}
        setAddress={setAddress}
        handleSearch={() => handleSearch()}
        loading={loading}
        error={error}
      />

      {hasLoadedTransactions && (
        <>
          <div className="relative mb-6 grid grid-cols-7 rounded-lg border md:flex-row">
            <div className="col-span-3 rounded-lg border shadow">
              <TransactionNetwork
                transactions={currentTransactions}
                address={address}
                onAddressChange={handleAddressChange}
                blockchainType={blockchainType}
              />
            </div>

            <TransactionList
              transactions={currentTransactions}
              address={address}
              blockchainType={blockchainType}
            />
          </div>

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
