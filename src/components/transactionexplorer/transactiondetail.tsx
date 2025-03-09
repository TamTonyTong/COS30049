import React, { useState } from "react";
import { Transaction } from "./type";

interface TransactionDetailProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({
  transaction,
  onClose,
}) => {
  const [showRawData, setShowRawData] = useState<boolean>(false);

  if (!transaction) return null;

  // Format ETH value
  const formatEth = (value: string | number) => {
    return (Number(value) / 1e18).toFixed(6) + " ETH";
  };

  // Format function input
  const shortenInput = (input: string) => {
    if (!input || input === "0x") return "-";
    if (input.length <= 10) return input;
    return input.substring(0, 10) + "...";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[80vh] w-4/5 max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">Transaction Details</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-200 p-2 hover:bg-gray-300"
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
          <div className="rounded border bg-gray-50 p-4">
            <h3 className="mb-2 text-lg font-semibold text-black">
              Basic Information
            </h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-black">Hash:</span>
                <div className="break-all text-sm text-black">
                  {transaction.hash}
                </div>
              </div>
              <div>
                <span className="font-medium text-black">Status:</span>
                <span
                  className={`ml-2 rounded-full px-2 py-1 text-sm ${
                    transaction.is_error === "0"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {transaction.is_error === "0" ? "Success" : "Failed"}
                </span>
              </div>
              <div>
                <span className="font-medium text-black">Block:</span>
                <span className="ml-2 text-sm text-black">
                  {transaction.block_number || "-"}
                </span>
              </div>
              <div>
                <span className="font-medium text-black">Timestamp:</span>
                <span className="ml-2 text-sm text-black">
                  {new Date(
                    transaction.block_timestamp * 1000,
                  ).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-black">Value:</span>
                <span className="ml-2 text-sm text-black">
                  {formatEth(transaction.value)}
                </span>
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div className="rounded border bg-gray-50 p-4">
            <h3 className="mb-2 text-lg font-semibold text-black">
              Address Information
            </h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-black">From:</span>
                <div className="break-all text-sm text-black">
                  {transaction.sender}
                </div>
              </div>
              <div>
                <span className="font-medium text-black">To:</span>
                <div className="break-all text-sm text-black">
                  {transaction.receiver}
                </div>
              </div>
              {transaction.contract_address && (
                <div>
                  <span className="font-medium text-black">Contract:</span>
                  <div className="break-all text-sm text-black">
                    {transaction.contract_address}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gas Info */}
          <div className="rounded border bg-gray-50 p-4">
            <h3 className="mb-2 text-lg font-semibold text-black">
              Gas Information
            </h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-black">Gas Limit:</span>
                <span className="ml-2 text-sm text-black">
                  {transaction.gas}
                </span>
              </div>
              <div>
                <span className="font-medium text-black">Gas Used:</span>
                <span className="ml-2 text-sm text-black">
                  {transaction.gas_used}
                </span>
              </div>
              <div>
                <span className="font-medium text-black">Gas Price:</span>
                <span className="ml-2 text-sm text-black">
                  {(Number(transaction.gas_price) / 1e9).toFixed(2)} Gwei
                </span>
              </div>
              <div>
                <span className="font-medium text-black">Transaction Fee:</span>
                <span className="ml-2 text-sm text-black">
                  {(Number(transaction.transaction_fee) / 1e18).toFixed(6)} ETH
                </span>
              </div>
            </div>
          </div>

          {/* Execution Info */}
          <div className="rounded border bg-gray-50 p-4">
            <h3 className="mb-2 text-lg font-semibold text-black">
              Execution Information
            </h3>
            <div className="space-y-2">
              {transaction.function_name && (
                <div>
                  <span className="font-medium text-black">Function:</span>
                  <span className="ml-2 text-sm text-black">
                    {transaction.function_name}
                  </span>
                </div>
              )}
              <div>
                <span className="font-medium text-black">Input Data:</span>
                <div className="mt-1 max-h-20 overflow-y-auto break-all rounded bg-gray-100 p-2 font-mono text-xs text-black">
                  {transaction.input !== "0x" ? transaction.input : "-"}
                </div>
              </div>
              <div>
                <span className="font-medium text-black">Nonce:</span>
                <span className="ml-2 text-sm text-black">
                  {transaction.nonce}
                </span>
              </div>
              <div>
                <span className="font-medium text-black">Position:</span>
                <span className="ml-2 text-sm text-black">
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
            className="mb-2 rounded bg-gray-200 px-4 py-2 text-black hover:bg-gray-300"
          >
            {showRawData ? "Hide" : "View"} Raw Transaction Data
          </button>

          {showRawData && (
            <div className="mt-2 max-h-60 overflow-y-auto rounded border bg-gray-100 p-4">
              <pre className="whitespace-pre-wrap text-xs text-black">
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
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            View on Etherscan
          </a>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
