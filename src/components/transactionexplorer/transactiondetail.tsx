import React, { useState } from "react";
import { Transaction } from "./type";

interface TransactionDetailProps {
  transaction: Transaction | null;
  onClose: () => void;
  blockchainType: "ETH" | "SWC";
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({
  transaction,
  onClose,
  blockchainType,
}) => {
  const [showRawData, setShowRawData] = useState<boolean>(false);

  if (!transaction) return null;

  // Format value with the correct currency
  const formatValue = (value: string | number) => {
    return (Number(value) / 1e18).toFixed(6) + ` ${blockchainType}`;
  };

  // Format function input
  const shortenInput = (input: string) => {
    if (!input || input === "0x") return "-";
    if (input.length <= 10) return input;
    return input.substring(0, 10) + "...";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="max-h-[80vh] w-4/5 max-w-3xl overflow-y-auto rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-100">
            Transaction Details
          </h2>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-700 p-2 text-gray-300 hover:bg-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Basic Info */}
          <div className="rounded border border-gray-700 bg-gray-900 p-4">
            <h3 className="mb-2 text-lg font-semibold text-gray-100">
              Basic Information
            </h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-300">Hash:</span>
                <div className="break-all text-sm text-gray-400">
                  {transaction.hash}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-300">Status:</span>
                <span
                  className={`ml-2 rounded-full px-2 py-1 text-sm ${
                    transaction.is_error === "1"
                      ? "bg-red-900 text-red-300"
                      : "bg-green-900 text-green-300"
                  }`}
                >
                  {transaction.is_error === "1" ? "Failed" : "Success"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-300">Block:</span>
                <span className="ml-2 text-sm text-gray-400">
                  {transaction.block_number || "-"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-300">Timestamp:</span>
                <span className="ml-2 text-sm text-gray-400">
                  {new Date(
                    Number(transaction.block_timestamp) * 1000,
                  ).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-300">Value:</span>
                <span className="ml-2 text-sm text-gray-400">
                  {formatValue(transaction.value)}
                </span>
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div className="rounded border border-gray-700 bg-gray-900 p-4">
            <h3 className="mb-2 text-lg font-semibold text-gray-100">
              Address Information
            </h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-300">From:</span>
                <div className="break-all text-sm text-gray-400">
                  {transaction.sender}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-300">To:</span>
                <div className="break-all text-sm text-gray-400">
                  {transaction.receiver}
                </div>
              </div>
              {transaction.contract_address && (
                <div>
                  <span className="font-medium text-gray-300">Contract:</span>
                  <div className="break-all text-sm text-gray-400">
                    {transaction.contract_address}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gas Info */}
          <div className="rounded border border-gray-700 bg-gray-900 p-4">
            <h3 className="mb-2 text-lg font-semibold text-gray-100">
              Gas Information
            </h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-300">Gas Limit:</span>
                <span className="ml-2 text-sm text-gray-400">
                  {transaction.gas}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-300">Gas Used:</span>
                <span className="ml-2 text-sm text-gray-400">
                  {transaction.gas_used}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-300">Gas Price:</span>
                <span className="ml-2 text-sm text-gray-400">
                  {(Number(transaction.gas_price) / 1e9).toFixed(2)} Gwei
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-300">
                  Transaction Fee:
                </span>
                <span className="ml-2 text-sm text-gray-400">
                  {(Number(transaction.transaction_fee) / 1e18).toFixed(6)}{" "}
                  {blockchainType}
                </span>
              </div>
            </div>
          </div>

          {/* Execution Info */}
          <div className="rounded border border-gray-700 bg-gray-900 p-4">
            <h3 className="mb-2 text-lg font-semibold text-gray-100">
              Execution Information
            </h3>
            <div className="space-y-2">
              {transaction.function_name && (
                <div>
                  <span className="font-medium text-gray-300">Function:</span>
                  <span className="ml-2 text-sm text-gray-400">
                    {transaction.function_name}
                  </span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-300">Input Data:</span>
                <div className="mt-1 max-h-20 overflow-y-auto break-all rounded bg-gray-800 p-2 font-mono text-xs text-gray-400">
                  {transaction.input !== "0x" ? transaction.input : "-"}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-300">Nonce:</span>
                <span className="ml-2 text-sm text-gray-400">
                  {transaction.nonce}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-300">Position:</span>
                <span className="ml-2 text-sm text-gray-400">
                  {transaction.transaction_index}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Raw Data Section */}
        <div className="mt-4">
          <button
            onClick={() => {
              setShowRawData(!showRawData);
              console.log("Raw transaction data:", transaction);
            }}
            className="mb-2 rounded bg-gray-700 px-4 py-2 text-gray-300 hover:bg-gray-600"
          >
            {showRawData ? "Hide" : "View"} Raw Transaction Data
          </button>

          {showRawData && (
            <div className="mt-2 max-h-60 overflow-y-auto rounded border border-gray-700 bg-gray-900 p-4">
              <pre className="whitespace-pre-wrap text-xs text-gray-400">
                {JSON.stringify(transaction, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="mt-6 flex justify-center">
          <a
            href={`https://etherscan.io/tx/${transaction.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            View on Etherscan
          </a>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
