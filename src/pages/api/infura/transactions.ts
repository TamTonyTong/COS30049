// src/pages/api/infura/transactions.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { fetchInfuraTransactions } from "../infuraapi";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { address, page } = req.query;

  if (!address || typeof address !== "string") {
    return res.status(400).json({ error: "Valid address required" });
  }

  try {
    const transactions = await fetchInfuraTransactions(
      address,
      page ? parseInt(page as string) : 1,
    );
    return res.status(200).json(transactions);
  } catch (error) {
    console.error("API route error:", error);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
}
