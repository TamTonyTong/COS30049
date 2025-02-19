"use client";
import React, { useState } from "react";

interface TransactionTableProps {
  transactions: {
    hash: string;
    from: string;
    to: string;
    value: string;
    blockNumber: string;
    timestamp: string;
    status: string;
  }[];
}

// Utility function to shorten hash or address
const shortenString = (str: string) => {
  return str.length > 10 ? `${str.slice(0, 6)}...${str.slice(-4)}` : str;
};
const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
}) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  // Function to toggle row expansion
  const toggleRow = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-semibold">Transaction Details</h2>
      <table className="min-w-full overflow-hidden rounded-lg border border-blue-500/30 bg-[#1a2b4b]/80">
        <thead>
          <tr className="bg-blue-500/20">
            <th className="px-4 py-2 text-center">Transaction Hash</th>
            <th className="px-4 py-2 text-center">From</th>
            <th className="px-4 py-2 text-center">To</th>
            <th className="px-4 py-2 text-center">Value (ETH)</th>
            <th className="px-4 py-2 text-center">Block Number</th>
            <th className="px-4 py-2 text-center">Timestamp</th>
            <th className="px-4 py-2 text-center">Status</th>
            <th className="px-4 py-2 text-center">See Full Address</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <React.Fragment key={index}>
              <tr className="border-b border-blue-500/30">
                <td className="px-4 py-2">{shortenString(tx.hash)}</td>
                <td className="px-4 py-2">{shortenString(tx.from)}</td>
                <td className="px-4 py-2">{shortenString(tx.to)}</td>
                <td className="px-4 py-2">{tx.value}</td>
                <td className="px-4 py-2">{tx.blockNumber}</td>
                <td className="px-4 py-2">{tx.timestamp}</td>
                <td className="px-4 py-2">{tx.status}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => toggleRow(index)}
                    className="text-blue-400 hover:text-blue-600 focus:outline-none"
                  >
                    {expandedRow === index ? "Hide" : "Show"}
                  </button>
                </td>
              </tr>
              {expandedRow === index && (
                <tr className="bg-blue-500/10">
                  <td colSpan={8} className="px-4 py-2">
                    <div>
                      <strong>Full Transaction Hash:</strong> {tx.hash}
                    </div>
                    <div>
                      <strong>Full From Address:</strong> {tx.from}
                    </div>
                    <div>
                      <strong>Full To Address:</strong> {tx.to}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
