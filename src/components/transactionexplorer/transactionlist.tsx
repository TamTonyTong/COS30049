import React, { useMemo, useState } from "react";
import { Transaction } from "@/src/components/transactionexplorer/type";
import TransactionDetail from "./transactiondetail";

interface TransactionListProps {
  transactions: Transaction[];
  address: string;
  blockchainType: "ETH" | "SWC";
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  address,
  blockchainType,
}) => {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction | null;
    direction: "ascending" | "descending" | null;
  }>({
    key: null,
    direction: null,
  });

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };
  const handleCloseDetail = () => {
    setSelectedTransaction(null);
  };
  // Sort transactions based on the current sort configuration
  const sortedTransactions = useMemo(() => {
    if (!sortConfig.key) return transactions;

    return [...transactions].sort((a, b) => {
      if (sortConfig.key === "value") {
        // Handle value as a number
        const aValue = Number(a[sortConfig.key]);
        const bValue = Number(b[sortConfig.key]);

        if (sortConfig.direction === "ascending") {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      } else {
        // Handle other fields as strings
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
      }
      return 0;
    });
  }, [transactions, sortConfig]);

  // Handle column header click for sorting
  const requestSort = (key: keyof Transaction) => {
    let direction: "ascending" | "descending" | null = "ascending";

    if (sortConfig.key === key) {
      if (sortConfig.direction === "ascending") {
        direction = "descending";
      } else if (sortConfig.direction === "descending") {
        direction = null;
      }
    }

    setSortConfig({ key: direction ? key : null, direction });
  };

  // Get sort direction indicator
  const getSortDirectionIndicator = (column: keyof Transaction) => {
    if (sortConfig.key !== column) return null;

    return sortConfig.direction === "ascending" ? " ↑" : " ↓";
  };
  return (
    <>
      <div className="col-span-4 w-full rounded-lg border p-8 shadow">
        {/* Add instructions/hint for sorting */}
        <div className="mb-2 text-xs italic text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-1 inline-block h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Click on column headers to sort transactions
        </div>
        <table className="min-w-full divide-y divide-gray-200 rounded-lg border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Hash
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Direction
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                onClick={() => requestSort("value")}
              >
                Value{" "}
                {getSortDirectionIndicator("value") ? (
                  <span className="ml-1">
                    {getSortDirectionIndicator("value")}
                  </span>
                ) : (
                  <span className="ml-1 transition-opacity">↕</span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sortedTransactions.map((transaction, index) => (
              <tr
                key={index}
                onClick={() => handleRowClick(transaction)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-xs text-gray-900">
                    {transaction.hash.substring(0, 7)}...
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-xs">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      transaction.sender && address
                        ? transaction.sender.toLowerCase() ===
                          address.toLowerCase()
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800" // Fallback style when sender is undefined
                    }`}
                  >
                    {transaction.sender
                      ? transaction.sender.toLowerCase() ===
                        address.toLowerCase()
                        ? "Outgoing"
                        : "Incoming"
                      : "Unknown"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-xs text-gray-500">
                  {(Number(transaction.value) / 1e18).toFixed(6)}{" "}
                  {blockchainType}
                </td>
                {/* <td className="whitespace-nowrap px-6 py-4 text-xs text-gray-500">
                  {transaction.gas_used || "-"}
                </td> */}
                <td className="break-words px-6 py-4 text-xs text-gray-500">
                  {new Date(
                    transaction.block_timestamp * 1000,
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetail
          transaction={selectedTransaction}
          onClose={handleCloseDetail}
          blockchainType={blockchainType}
        />
      )}
    </>
  );
};

export default TransactionList;
