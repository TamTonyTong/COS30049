import { NextApiRequest, NextApiResponse } from "next";
import { Driver } from "neo4j-driver";
import { getDbDriver } from "@/src/pages/api/infura/2nd-database-connection";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { hash } = req.query;

  if (!hash || typeof hash !== "string") {
    return res.status(400).json({ error: "Transaction hash is required" });
  }

  let driver: Driver | null = null;

  try {
    driver = getDbDriver();
    if (!driver) {
      return res.status(500).json({ error: "Failed to connect to database" });
    }
    const session = driver.session();

    const result = await session.run(
      `MATCH (tx:Transaction {hash: $hash}) 
       RETURN tx`,
      { hash },
    );

    await session.close();

    if (result.records.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    console.log("Raw Transactions", result.records[0].get("tx").properties);
    const txNode = result.records[0].get("tx").properties;
    const transaction = {
      hash: txNode.hash,
      block_timestamp: txNode.block_timestamp,
      block_number: txNode.block_number,
      from_address: txNode.from_address,
      to_address: txNode.to_address,
      value: txNode.value,
      transaction_index: txNode.transaction_index,
      gas: txNode.gas,
      gas_price: txNode.gas_price,
      input: txNode.input,
      receipt_cumulative_gas_used: txNode.receipt_cumulative_gas_used,
      receipt_gas_used: txNode.receipt_gas_used,
      receipt_status: txNode.receipt_status,
      sender: txNode.from_address,
      receiver: txNode.to_address,
      direction: "", // Will be set in UI based on context
    };
    // console.log("Transaction found:", transaction);
    return res.status(200).json({ transaction });
  } catch (error) {
    console.error("Error fetching transaction by hash:", error);
    return res.status(500).json({ error: "Failed to fetch transaction" });
  } finally {
    // Make sure to close the session first

    if (driver) {
      await driver.close();
    }
  }
}
