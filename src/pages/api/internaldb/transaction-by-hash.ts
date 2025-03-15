import type { NextApiRequest, NextApiResponse } from "next";
import { runQuery } from "./database-connection";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { hash } = req.query;

  if (!hash || typeof hash !== "string") {
    return res.status(400).json({ error: "Valid transaction hash required" });
  }

  console.log(`API Request: Search for transaction hash ${hash}`);

  try {
    const query = `
      MATCH (sender:Address)-[tx:Transaction {hash: $hash}]->(receiver:Address)
      RETURN {
        hash: tx.hash,
        sender: sender.addressId,
        receiver: receiver.addressId,
        direction: "outgoing",
        value: tx.value,
        input: tx.input,
        transaction_index: tx.transaction_index,
        gas: tx.gas,
        gas_used: tx.gas_used,
        gas_price: tx.gas_price,
        transaction_fee: tx.transaction_fee,
        block_number: tx.block_number,
        block_hash: tx.block_hash,
        block_timestamp: tx.block_timestamp
      } as transaction
    `;

    const results = await runQuery(query, { hash });

    if (results.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    return res.status(200).json({ transaction: results[0].transaction });
  } catch (error) {
    console.error("Error fetching transaction by hash:", error);
    return res.status(500).json({ error: "Failed to fetch transaction" });
  }
}
