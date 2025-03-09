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
  console.log(
    `Syncing Etherscan data for address: ${address}, forceFresh: ${forceFresh}`,
  );

  // If address was recently synced and we don't force fresh data
  const lastSynced = syncedAddresses.get(address);
  const now = Date.now();
  if (lastSynced && !forceFresh && now - lastSynced < 15 * 60 * 1000) {
    // If synced in last 15 minutes, just get from Neo4j
    console.log(
      `Using cached data for ${address} (last synced ${(now - lastSynced) / 1000}s ago)`,
    );
    return await getEtherscanTransactionsFromNeo4j(address);
  }

  try {
    console.log(`Fetching fresh data from Etherscan for ${address}`);
    // Fetch transactions from Etherscan
    const transactions = await fetchEtherscanTransactions(address);
    console.log(`Fetched ${transactions.length} transactions from Etherscan`);

    // If we have transactions, store them in Neo4j
    if (transactions.length > 0) {
      console.log(`Storing ${transactions.length} transactions in Neo4j`);
      await storeEtherscanTransactions(transactions, address);
      console.log(`Successfully stored transactions in Neo4j`);
    }

    // Mark this address as synced
    syncedAddresses.set(address, now);
    console.log(
      `Address ${address} marked as synced at ${new Date(now).toLocaleString()}`,
    );

    // Return the transactions (from Neo4j for consistency)
    console.log(`Fetching synced transactions from Neo4j for ${address}`);
    const neotransactions = await getEtherscanTransactionsFromNeo4j(address);
    console.log(`Retrieved ${neotransactions.length} transactions from Neo4j`);
    return neotransactions;
  } catch (error) {
    console.error("Error syncing from Etherscan:", error);
    // If error fetching from Etherscan, try returning data from Neo4j
    console.log(`Falling back to Neo4j data after error for ${address}`);
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
