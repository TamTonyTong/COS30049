import React, { useState } from "react";
import { Transaction } from "@/src/components/transactionexplorer/type";
import TransactionDetail from "@/src/components/transactionexplorer/transactiondetail";

interface TransactionListProps {
  transactions: Transaction[];
  address: string;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  address,
}) => {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  return (
    <>
      <div className="w-full overflow-hidden rounded-lg border shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Hash
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Direction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Gas Used
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {transactions.map((transaction, index) => (
              <tr
                key={index}
                onClick={() => handleRowClick(transaction)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {transaction.hash.substring(0, 10)}...
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      transaction.sender.toLowerCase() === address.toLowerCase()
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {transaction.sender.toLowerCase() === address.toLowerCase()
                      ? "OUT"
                      : "IN"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {(Number(transaction.value) / 1e18).toFixed(6)} ETH
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {transaction.gas_used || "-"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(
                    transaction.block_timestamp * 1000,
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* {selectedTransaction && (
        <TransactionDetail
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )} */}
    </>
  );
};

export default TransactionList;
