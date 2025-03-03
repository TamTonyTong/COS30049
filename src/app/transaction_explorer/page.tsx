"use client";
import React, { useState } from "react";
import { fetchTransactions } from "@/src/pages/api/fetchTransaction";
import { fetchEtherscanTransactions } from "@/src/pages/api/etherscanapi";
import {
  syncEtherscanData,
  getEtherscanPageFromDb,
} from "@/src/pages/api/etherscan-sync";
import SearchBar from "@/src/components/transactionexplorer/searchbar";
import TransactionList from "@/src/components/transactionexplorer/transactionlist";
import Pagination from "@/src/components/transactionexplorer/pagnition";
import TransactionNetwork from "@/src/components/transactionexplorer/transactionetwork";
import { Transaction } from "@/src/components/transactionexplorer/type";

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
  // Update data source options to include synced
  const [dataSource, setDataSource] = useState<
    "internal" | "etherscan" | "synced"
  >("internal");

  const handleSearch = async (addressToSearch: string = address) => {
    if (!addressToSearch) return;
    setLoading(true);
    setError(null);

    try {
      let extractedTransactions: Transaction[] = [];

      if (dataSource === "internal") {
        // Existing logic for internal data source
        const data = await fetchTransactions(addressToSearch, "initial");
        extractedTransactions = data.length > 0 ? data[0].transactions : [];
      } else if (dataSource === "etherscan") {
        // Direct Etherscan API calls
        extractedTransactions =
          await fetchEtherscanTransactions(addressToSearch);
      } else if (dataSource === "synced") {
        // New synced approach - fetch, store, then retrieve
        extractedTransactions = await syncEtherscanData(addressToSearch);
      }

      console.log(extractedTransactions);

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
        setHasMore(extractedTransactions.length >= 4);
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
    if (dataSource === "internal" && !lastIndex) return;
    setLoading(true);
    setError(null);

    try {
      let extractedTransactions: Transaction[] = [];
      const nextPage = currentPage + 1;

      if (dataSource === "internal") {
        // Existing logic for your internal data source
        const newData = await fetchTransactions(address, "older", lastIndex);
        extractedTransactions =
          newData.length > 0 ? newData[0].transactions : [];
      } else if (dataSource === "etherscan") {
        // Direct from Etherscan
        extractedTransactions = await fetchEtherscanTransactions(
          address,
          nextPage,
        );
      } else if (dataSource === "synced") {
        // Get from synced Neo4j database
        extractedTransactions = await getEtherscanPageFromDb(address, nextPage);
      }

      if (extractedTransactions.length > 0) {
        setTransactionsByPage((prev) => ({
          ...prev,
          [nextPage]: extractedTransactions,
        }));

        if (dataSource === "internal") {
          setLastIndex(
            extractedTransactions.length > 0
              ? Number(extractedTransactions.at(-1)?.transaction_index) ||
                  undefined
              : undefined,
          );
        }
        setCurrentPage(nextPage);
        setLoadedPages((prev) => [...prev, nextPage]);
        setHasMore(extractedTransactions.length >= 4);
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
    // Reset pagination and search with the new address
    setTransactionsByPage({});
    setLastIndex(undefined);
    setCurrentPage(1);
    setLoadedPages([]);
    handleSearch(newAddress);
  };

  const selectDataSource = (source: "internal" | "etherscan" | "synced") => {
    setDataSource(source);
    // Reset data when switching sources
    setTransactionsByPage({});
    setLastIndex(undefined);
    setCurrentPage(1);
    setLoadedPages([]);
  };

  const hasLoadedTransactions = Object.keys(transactionsByPage).length > 0;
  const maxPage = Math.max(...loadedPages, 0);
  const currentTransactions = transactionsByPage[currentPage] || [];
  return (
    <div className="mx-auto max-w-6xl p-4">
      <h2 className="mb-4 text-xl font-bold">Transaction Explorer</h2>

      {/* Updated data source toggle */}
      <div className="mb-4">
        <span className="mr-2 text-sm font-medium">Data Source:</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => selectDataSource("internal")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              dataSource === "internal"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Internal DB
          </button>
          <button
            onClick={() => selectDataSource("etherscan")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              dataSource === "etherscan"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Etherscan API
          </button>
          <button
            onClick={() => selectDataSource("synced")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              dataSource === "synced"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Synced Etherscan
          </button>
        </div>
      </div>

      <SearchBar
        address={address}
        setAddress={setAddress}
        handleSearch={() => handleSearch()}
        loading={loading}
        error={error}
      />

      {hasLoadedTransactions && (
        <>
          <div className="mb-6 flex rounded-lg border bg-black">
            <TransactionNetwork
              transactions={currentTransactions}
              address={address}
              onAddressChange={handleAddressChange}
            />
            <table className="w-1/2 rounded-lg bg-black">
              <thead className="bg-gray-200">
                <tr>
                  <th className="text-middle px-2 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                    ID
                  </th>
                  <th className="text-middle px-2 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Receiver
                  </th>
                  <th className="text-middle px-2 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Value
                  </th>
                  <th className="text-middle px-2 py-3 text-xs font-medium uppercase text-gray-500">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-gray-200">
                {currentTransactions.map((t, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-2 py-4 text-xs text-gray-900">
                      {t.transaction_index}
                    </td>
                    <td className="whitespace-nowrap px-2 py-4 text-xs text-gray-500">
                      {t.receiver ? t.receiver : address}
                    </td>
                    <td className="whitespace-nowrap px-2 py-4 text-xs text-gray-500">
                      {(Number(t.value) / 1e18).toFixed(4)} ETH
                    </td>
                    <td className="whitespace-nowrap py-4 text-xs text-gray-500">
                      {new Date(t.block_timestamp * 1000).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mb-2 text-lg font-semibold">Transaction List</h3>

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
