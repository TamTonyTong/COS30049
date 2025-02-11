// pages/api/getTransactions.ts
import { NextApiRequest, NextApiResponse } from "next";
import driver from "@/lib/neo4j";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Only GET requests allowed" });
  }

  const { address } = req.query;

  try {
    const session = driver.session();
    const result = await session.run(
      `
      MATCH (from:Wallet {address: $address})-[:SENT]->(to:Wallet)
      RETURN from.address AS from, to.address AS to, value, timestamp, hash
      `,
      { address }
    );
    await session.close();

    const transactions = result.records.map((record) => ({
      from: record.get("from"),
      to: record.get("to"),
      value: record.get("value"),
      timestamp: record.get("timestamp"),
      hash: record.get("hash"),
    }));

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
}