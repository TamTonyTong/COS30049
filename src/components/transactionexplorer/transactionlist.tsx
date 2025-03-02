import React from "react";
import { Transaction } from "@/src/components/transactionexplorer/type";

interface TransactionListProps {
  transactions: Transaction[];
  currentPage: number;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  currentPage,
}) => {
  return (
    <>
      {/* <div className="mb-4"> */}
      {/* <h3 className="mb-2 text-lg font-semibold">
        Transactions (Page {currentPage})
      </h3> */}
      {transactions.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {transactions.map((t, index) => (
            <li key={index} className="py-3">
              <div className="rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <p>
                  <strong>Transaction ID:</strong> {t.transaction_index}
                </p>
                <p>
                  <strong>Block Timestamp:</strong>{" "}
                  {new Date(t.block_timestamp * 1000).toLocaleString()}
                </p>
                <p className="mt-1 truncate text-sm text-gray-500">
                  <strong>Hash:</strong> {t.hash}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No transactions found for this page.</p>
      )}
      {/* </div> */}
    </>
  );
};

export default TransactionList;
