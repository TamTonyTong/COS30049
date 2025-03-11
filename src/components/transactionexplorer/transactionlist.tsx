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
      } else if (sortConfig.key) {
        // Handle other fields as strings
        const key = sortConfig.key;
        if (a[key] < b[key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[key] > b[key]) {
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
  // Format value with the correct currency
  const formatValue = (value: string | number) => {
    return (Number(value) / 1e18).toFixed(6) + ` ${blockchainType}`;
  };
  return (
    <>
      <div className="col-span-4 w-full rounded-lg border border-gray-700 bg-gray-800 p-8 shadow">
        {/* Add instructions/hint for sorting with updated styles */}
        <div className="mb-2 text-xs italic text-gray-400">
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
        <table className="min-w-full divide-y divide-gray-700 rounded-lg border border-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Hash
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Sender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Receiver
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
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
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-800">
            {sortedTransactions.map((transaction, index) => (
              <tr
                key={index}
                onClick={() => handleRowClick(transaction)}
                className="cursor-pointer transition-colors duration-150 hover:bg-gray-700"
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-xs text-gray-300">
                    {transaction.hash.substring(0, 7)}...
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-xs text-gray-400">
                  {transaction.sender.substring(0, 4)}...
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-xs text-gray-400">
                  {transaction.receiver.substring(0, 4)}...
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-xs text-gray-400">
                  {formatValue(transaction.value)}
                </td>
                <td className="break-words px-6 py-4 text-xs text-gray-400">
                  {new Date(
                    Number(transaction.block_timestamp) * 1000,
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
