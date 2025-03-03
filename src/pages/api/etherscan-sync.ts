// src/pages/api/etherscan-sync.ts
import { fetchEtherscanTransactions } from "./etherscanapi";
import {
  storeEtherscanTransactions,
  getEtherscanTransactionsFromNeo4j,
} from "./neo4j/etherscan-transactions";
import { Transaction } from "@/src/components/transactionexplorer/type";

// Cache to track recently synced addresses
const syncedAddresses = new Map<string, number>();

export async function syncEtherscanData(
  address: string,
  forceFresh = false,
): Promise<Transaction[]> {
  // If address was recently synced and we don't force fresh data
  const lastSynced = syncedAddresses.get(address);
  const now = Date.now();
  if (lastSynced && !forceFresh && now - lastSynced < 5 * 60 * 1000) {
    // If synced in last 5 minutes, just get from Neo4j
    return await getEtherscanTransactionsFromNeo4j(address);
  }

  try {
    // Fetch transactions from Etherscan
    const transactions = await fetchEtherscanTransactions(address);

    // If we have transactions, store them in Neo4j
    if (transactions.length > 0) {
      await storeEtherscanTransactions(transactions, address);
    }

    // Mark this address as synced
    syncedAddresses.set(address, now);

    // Return the transactions (from Neo4j for consistency)
    return await getEtherscanTransactionsFromNeo4j(address);
  } catch (error) {
    console.error("Error syncing from Etherscan:", error);
    // If error fetching from Etherscan, try returning data from Neo4j
    return await getEtherscanTransactionsFromNeo4j(address);
  }
}

export async function getEtherscanPageFromDb(
  address: string,
  page: number = 1,
): Promise<Transaction[]> {
  // Get data from Neo4j
  return await getEtherscanTransactionsFromNeo4j(address, page);
}
