// src/pages/api/infura-sync.ts
import { fetchInfuraTransactions } from "./infuraapi";
import {
  storeInfuraTransactions,
  getInfuraTransactionsFromNeo4j,
} from "@/src/pages/api/neo4j/infura-transactions";
import { Transaction } from "@/src/components/transactionexplorer/type";
import { ethers } from "ethers";

// Cache to track recently synced addresses
// Cache management functions at the top of the file
const CACHE_KEY = "infura_synced_addresses";
const CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes in milliseconds

// Function to load cache from localStorage
function loadSyncedAddressesCache(): Map<string, number> {
  if (typeof window === "undefined") {
    // Running on server, return empty map
    return new Map<string, number>();
  }

  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      return new Map(Object.entries(parsed));
    }
  } catch (error) {
    console.error("Error loading synced addresses cache:", error);
  }

  return new Map<string, number>();
}

// Function to save cache to localStorage
function saveSyncedAddressesCache(cache: Map<string, number>): void {
  if (typeof window === "undefined") {
    // Running on server, do nothing
    return;
  }

  try {
    const cacheObject = Object.fromEntries(cache.entries());
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
  } catch (error) {
    console.error("Error saving synced addresses cache:", error);
  }
}

// Initialize the cache from localStorage
const syncedAddresses = loadSyncedAddressesCache();
export async function syncInfuraData(
  address: string,
  forceFresh = false,
): Promise<Transaction[]> {
  console.log(
    `Syncing Infura data for address: ${address}, forceFresh: ${forceFresh}`,
  );

  // If address was recently synced and we don't force fresh data
  const lastSynced = syncedAddresses.get(address);
  const now = Date.now();
  if (lastSynced && !forceFresh && now - lastSynced < 15 * 60 * 1000) {
    // If synced in last 15 minutes, just get from Neo4j
    console.log(
      `Using cached data for ${address} (last synced ${(now - lastSynced) / 1000}s ago)`,
    );
    return await getInfuraTransactionsFromNeo4j(address);
  }

  try {
    console.log(`Fetching fresh data from Infura for ${address}`);
    // Fetch transactions from Infura
    const transactions = await fetchInfuraTransactions(address);
    console.log(`Fetched ${transactions.length} transactions from Infura`);

    // If we have transactions, store them in Neo4j
    if (transactions.length > 0) {
      console.log(`Storing ${transactions.length} transactions in Neo4j`);
      await storeInfuraTransactions(transactions, address);
      console.log(`Successfully stored Infura transactions in Neo4j`);
    }

    // Mark this address as synced
    syncedAddresses.set(address, now);
    saveSyncedAddressesCache(syncedAddresses);

    console.log(
      `Address ${address} marked as synced at ${new Date(now).toLocaleString()}`,
    );

    // Return the transactions (from Neo4j for consistency)
    console.log(`Fetching synced transactions from Neo4j for ${address}`);
    const neoTransactions = await getInfuraTransactionsFromNeo4j(address);
    console.log(`Retrieved ${neoTransactions.length} transactions from Neo4j`);
    return neoTransactions;
  } catch (error) {
    console.error("Error syncing from Infura:", error);
    // If error fetching from Infura, try returning data from Neo4j
    console.log(`Falling back to Neo4j data after error for ${address}`);
    return await getInfuraTransactionsFromNeo4j(address);
  }
}

export async function getInfuraPageFromDb(
  address: string,
  page: number = 1,
): Promise<Transaction[]> {
  // Get data from Neo4j
  return await getInfuraTransactionsFromNeo4j(address, page);
}
// Add this new function to your existing file

export const getTransactionByHash = async (
  hash: string,
): Promise<Transaction | null> => {
  try {
    // First try to get from database
    const response = await fetch(
      `/api/neo4j/get-transaction-by-hash?hash=${hash}`,
    );
    const data = await response.json();

    if (data && data.transaction) {
      console.log("Found transaction in DB:", hash);
      return data.transaction;
    }

    // If not in database, try Infura
    console.log("Fetching transaction from Infura:", hash);
    const provider = new ethers.InfuraProvider(
      "mainnet",
      process.env.NEXT_PUBLIC_INFURA_API_KEY,
    );

    const txData = await provider.getTransaction(hash);
    if (!txData) {
      console.log("Transaction not found:", hash);
      return null;
    }

    const txReceipt = await provider.getTransactionReceipt(hash);
    const gasUsedValue = txReceipt?.gasUsed
      ? BigInt(txReceipt.gasUsed.toString())
      : BigInt(0);
    const gasPriceValue = txData.gasPrice
      ? BigInt(txData.gasPrice.toString())
      : BigInt(0);
    // Convert to our Transaction format
    const transaction: Transaction = {
      hash: txData.hash,
      block_timestamp: new Date().toISOString(), // We don't have timestamp from getTransaction
      block_number: txData.blockNumber?.toString() || "",
      from_address: txData.from,
      to_address: txData.to || "",
      value: txData.value.toString(),
      transaction_index: txData.transactionIndex?.toString() || "0",
      gas: txData.gasLimit.toString(),
      gas_used: txReceipt?.gasUsed?.toString() || "0",
      gas_price: txData.gasPrice?.toString() || "0",
      transaction_fee: (gasUsedValue * gasPriceValue).toString(),
      input: txData.data,
      receipt_cumulative_gas_used:
        txReceipt?.cumulativeGasUsed?.toString() || "0",
      receipt_status: txReceipt?.status ? "1" : "0",
      // Add relevant fields for visualization
      sender: txData.from,
      receiver: txData.to || "",
      direction: "", // This will be set in the UI based on address context
    };

    // Also save to the database for future queries
    try {
      await fetch("/api/neo4j/save-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transaction }),
      });
    } catch (err) {
      console.error("Error saving transaction to DB:", err);
    }

    return transaction;
  } catch (error) {
    console.error("Error fetching transaction by hash:", error);
    return null;
  }
};
