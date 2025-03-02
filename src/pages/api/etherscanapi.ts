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
}

// You'll need to get an API key from https://etherscan.io/apis
const ETHERSCAN_API_KEY =
  process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || "YOUR_API_KEY";
const BASE_URL = "https://api.etherscan.io/api";

export async function fetchEtherscanTransactions(
  address: string,
  page: number = 1,
  offset: number = 8, // Number of transactions per page
): Promise<Transaction[]> {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        module: "account",
        action: "txlist",
        address,
        startblock: 0,
        endblock: 99999999,
        page,
        offset,
        sort: "desc",
        apikey: ETHERSCAN_API_KEY,
      },
    });

    if (response.data.status === "1") {
      // Transform Etherscan data to match your Transaction type
      return response.data.result.map((tx: any, index: number) => ({
        transaction_index: tx.nonce,
        block_timestamp: parseInt(tx.timeStamp),
        value: tx.value,
        sender: tx.from,
        receiver: tx.to,
        gas: tx.gas,
        gas_price: tx.gasPrice,
        hash: tx.hash,
        // Add any other fields required by your Transaction type
      }));
    } else {
      console.error("Etherscan API error:", response.data.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching from Etherscan:", error);
    throw error;
  }
}
