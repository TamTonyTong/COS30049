// src/pages/api/infura-sync.ts
import { fetchInfuraTransactions } from "./infuraapi";
import {
  storeInfuraTransactions,
  getInfuraTransactionsFromNeo4j,
} from "@/src/pages/api/neo4j/infura-transactions";
import { Transaction } from "@/src/components/transactionexplorer/type";

// Cache to track recently synced addresses
const syncedAddresses = new Map<string, number>();

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
