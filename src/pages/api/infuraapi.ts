// src/pages/api/infuraapi.ts
import axios from "axios";
import { Transaction } from "@/src/components/transactionexplorer/type";

// Use server-side environment variable (not NEXT_PUBLIC_)
const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY;
const INFURA_ENDPOINT = `https://mainnet.infura.io/v3/${INFURA_API_KEY}`;
console.log("Using Infura endpoint:", INFURA_ENDPOINT);

// Retry logic with exponential backoff
async function fetchWithRetry(data: any, retries = 3, delay = 1000) {
  try {
    console.log(`Making request to Infura: ${data.method}`, data.params);
    const response = await axios.post(INFURA_ENDPOINT, data);
    console.log(
      `Response received for ${data.method}:`,
      data.method === "eth_blockNumber" ||
        data.method === "eth_getTransactionCount" ||
        data.method === "eth_getBalance"
        ? response.data.result
        : "Response too large to log",
    );
    return response;
  } catch (error: any) {
    console.error(`Error in ${data.method}:`, error.message);
    if (retries <= 0 || error?.response?.status !== 429) {
      throw error;
    }

    console.log(`Rate limited, retrying in ${delay}ms...`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return fetchWithRetry(data, retries - 1, delay * 2);
  }
}

export async function fetchInfuraTransactions(
  address: string,
  page: number = 1,
): Promise<Transaction[]> {
  try {
    console.log(`Fetching transactions for address: ${address}, page: ${page}`);

    // 1. Get latest block number
    console.log("Step 1: Getting latest block number");
    const blockResponse = await fetchWithRetry({
      jsonrpc: "2.0",
      method: "eth_blockNumber",
      params: [],
      id: 1,
    });
    const latestBlock = parseInt(blockResponse.data.result, 16);
    console.log(`Latest block: ${latestBlock} (0x${latestBlock.toString(16)})`);

    // 2. Get transaction count for address
    console.log("Step 2: Getting transaction count for address");
    const countResponse = await fetchWithRetry({
      jsonrpc: "2.0",
      method: "eth_getTransactionCount",
      params: [address, "latest"],
      id: 2,
    });
    const txCount = parseInt(countResponse.data.result, 16);
    console.log(`Transaction count for ${address}: ${txCount}`);

    // 3. Get account balance
    console.log("Step 3: Getting account balance");
    const balanceResponse = await fetchWithRetry({
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [address, "latest"],
      id: 3,
    });
    const balance = parseInt(balanceResponse.data.result, 16);
    console.log(
      `Balance for ${address}: ${balance} wei (${balance / 1e18} ETH)`,
    );

    // If account has no transactions, return early
    if (txCount === 0 && balance === 0) {
      console.log(
        "Account has no transactions and zero balance. Returning empty array.",
      );
      return [];
    }

    // Instead of scanning blocks and logs (which hits rate limits),
    // let's get recent blocks and check each transaction
    const PAGE_SIZE = 8;

    // Increase the number of blocks to check - 10 might be too few
    const NUM_BLOCKS_TO_CHECK = 30;
    const blocksToCheck = Array.from(
      { length: NUM_BLOCKS_TO_CHECK },
      (_, i) => latestBlock - i,
    );
    console.log(
      `Will check ${blocksToCheck.length} blocks, from ${blocksToCheck[0]} to ${blocksToCheck[blocksToCheck.length - 1]}`,
    );

    let allTxs: Transaction[] = [];
    let blockCounter = 0;

    // Process blocks sequentially to avoid rate limits
    for (const blockNum of blocksToCheck) {
      blockCounter++;
      console.log(
        `Checking block ${blockNum} (${blockCounter}/${blocksToCheck.length})`,
      );

      // Stop if we already have enough transactions
      if (allTxs.length >= PAGE_SIZE * page) {
        console.log(
          `Found enough transactions (${allTxs.length}). Stopping block check.`,
        );
        break;
      }

      // Get block info
      const blockResponse = await fetchWithRetry({
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        // Last parameter true means include full transaction objects
        params: [`0x${blockNum.toString(16)}`, true],
        id: 4,
      });

      if (!blockResponse.data.result?.transactions) {
        console.log(`No transactions found in block ${blockNum}`);
        continue;
      }

      console.log(
        `Block ${blockNum} has ${blockResponse.data.result.transactions.length} transactions`,
      );

      // Filter transactions related to our address
      const relatedTxs = blockResponse.data.result.transactions.filter(
        (tx: any) =>
          tx.from?.toLowerCase() === address.toLowerCase() ||
          tx.to?.toLowerCase() === address.toLowerCase(),
      );

      console.log(
        `Found ${relatedTxs.length} transactions related to address ${address} in block ${blockNum}`,
      );

      // Get details for each transaction
      for (const tx of relatedTxs) {
        console.log(`Processing transaction ${tx.hash}`);

        // Get transaction receipt for gas used
        const receiptResponse = await fetchWithRetry({
          jsonrpc: "2.0",
          method: "eth_getTransactionReceipt",
          params: [tx.hash],
          id: 5,
        });

        const receipt = receiptResponse.data.result;
        const gasUsed = receipt ? parseInt(receipt.gasUsed, 16) : 0;
        const gasPrice = parseInt(tx.gasPrice, 16);

        console.log(
          `Transaction ${tx.hash}: gasUsed=${gasUsed}, gasPrice=${gasPrice}`,
        );

        allTxs.push({
          hash: tx.hash,
          value: tx.value,
          input: tx.input,
          gas: parseInt(tx.gas, 16).toString(),
          gas_price: gasPrice,
          gas_used: gasUsed,
          transaction_fee: gasPrice * gasUsed,
          block_number: parseInt(tx.blockNumber, 16).toString(),
          transaction_index: parseInt(tx.transactionIndex, 16).toString(),
          block_hash: tx.blockHash,
          block_timestamp: parseInt(blockResponse.data.result.timestamp, 16),
          receiver: tx.to || "0x0000000000000000000000000000000000000000", // Contract creation
          sender: tx.from,
          direction:
            tx.from.toLowerCase() === address.toLowerCase()
              ? "outgoing"
              : "incoming",
        });

        console.log(
          `Added transaction to results. Total so far: ${allTxs.length}`,
        );

        // Add a small delay between requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    // Sort by block number (descending)
    allTxs.sort(
      (a, b) =>
        parseInt(String(b.block_number)) - parseInt(String(a.block_number)),
    );

    // Apply pagination
    const startIdx = (page - 1) * PAGE_SIZE;
    const endIdx = startIdx + PAGE_SIZE;
    const result = allTxs.slice(startIdx, endIdx);

    console.log(
      `Returning ${result.length} transactions (from index ${startIdx} to ${endIdx})`,
    );
    return result;
  } catch (error) {
    console.error("Error fetching from Infura:", error);
    throw error;
  }
}
