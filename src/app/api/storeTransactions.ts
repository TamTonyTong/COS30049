// pages/api/storeTransactions.ts
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import driver from "@/lib/neo4j";

const ETHERSCAN_API_KEY = "your_etherscan_api_key";
const ETHERSCAN_URL = "https://api.etherscan.io/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { address } = req.body;

  try {
    // Fetch transactions from Etherscan
    const response = await axios.get(ETHERSCAN_URL, {
      params: {
        module: "account",
        action: "txlist",
        address: address,
        startblock: 0,
        endblock: 99999999,
        sort: "asc",
        apikey: ETHERSCAN_API_KEY,
      },
    });

    const transactions = response.data.result;

    // Store transactions in Neo4j
    const session = driver.session();
    for (const tx of transactions) {
      await session.run(
        `
        MERGE (from:Wallet {address: $from})
        MERGE (to:Wallet {address: $to})
        CREATE (from)-[:SENT {value: $value, timestamp: $timestamp, hash: $hash}]->(to)
        `,
        {
          from: tx.from,
          to: tx.to,
          value: (Number(tx.value) / 1e18).toString(), // Convert Wei to ETH
          timestamp: new Date(tx.timeStamp * 1000).toISOString(), // Convert to ISO format
          hash: tx.hash,
        }
      );
    }
    await session.close();

    res.status(200).json({ message: "Transactions stored successfully" });
  } catch (error) {
    console.error("Error storing transactions:", error);
    res.status(500).json({ message: "Failed to store transactions" });
  }
}