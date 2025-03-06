// Create a new file: src/pages/api/etherscanApi.ts

import axios from "axios";
interface Transaction {
  hash: string;
  value: number | string;
  input: number;
  gas: number;
  gas_used: number;
  gas_price: number;
  transaction_fee: number;
  block_number: number;
  transaction_index: string;
  block_hash: string;
  block_timestamp: number;
  receiver: string;
  sender: string;
  direction: "incoming" | "outgoing";
}

export async function fetchEtherscanTransactions(
  address: string,
  page: number = 1,
): Promise<Transaction[]> {
  try {
    // Use the backend proxy instead of calling Etherscan directly
    const response = await axios.get(`/api/wallet/transaction`, {
      params: {
        address,
        page,
        offset: 10,
      },
    });
    if (response.data.status === "1") {
      // Transform Etherscan data to match your Transaction type
      const transformedData = response.data.result.map(
        (tx: any, index: number) => {
          const transaction = {
            transaction_index: tx.transactionIndex,
            block_timestamp: parseInt(tx.timeStamp),
            value: tx.value,
            sender: tx.from,
            receiver: tx.to,
            gas: tx.gas,
            gas_price: tx.gasPrice,
            gas_used: tx.gasUsed || "0",
            transaction_fee: tx.gasUsed
              ? (BigInt(tx.gasUsed) * BigInt(tx.gasPrice)).toString()
              : "0",
            hash: tx.hash,
            block_number: parseInt(tx.blockNumber),
            block_hash: tx.blockHash || "",
            input: tx.input || "0x",
            method_id: tx.methodId || "",
            function_name: tx.functionName || "",
            contract_address: tx.contractAddress || "",
            cumulative_gas_used: tx.cumulativeGasUsed || "0",
            tx_receipt_status: tx.txreceipt_status || "",
            confirmations: tx.confirmations || "0",
            is_error: tx.isError || "0",
            nonce: tx.nonce || "0",
          };

          // Log each transformed transaction
          console.log(`Transformed transaction ${index}:`, transaction);

          return transaction;
        },
      );

      return transformedData;
    } else {
      console.error("Etherscan API error:", response.data.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching from Etherscan:", error);
    throw error;
  }
}
