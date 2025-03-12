import { NextApiRequest, NextApiResponse } from "next";
import { Driver } from "neo4j-driver";
import { getDbDriver } from "@/src/pages/api/neo4j/2nd-database-connection";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { transaction } = req.body;

  if (!transaction || !transaction.hash) {
    return res
      .status(400)
      .json({ error: "Valid transaction data is required" });
  }

  let driver: Driver | null = null;

  try {
    driver = getDbDriver();
    if (!driver) {
      return res.status(500).json({ error: "Failed to connect to database" });
    }
    const session = driver.session();

    // First, check if transaction already exists to avoid duplicates
    const checkResult = await session.run(
      `MATCH (tx:Transaction {hash: $hash}) 
       RETURN tx`,
      { hash: transaction.hash },
    );

    if (checkResult.records.length > 0) {
      await session.close();
      return res.status(200).json({ message: "Transaction already exists" });
    }

    // Create the transaction node and its relationships
    await session.run(
      `CREATE (tx:Transaction {
        hash: $hash,
        block_timestamp: $block_timestamp,
        block_number: $block_number,
        from_address: $from_address,
        to_address: $to_address,
        value: $value,
        transaction_index: $transaction_index,
        gas: $gas,
        gas_price: $gas_price,
        input: $input,
        receipt_cumulative_gas_used: $receipt_cumulative_gas_used,
        receipt_gas_used: $receipt_gas_used,
        receipt_status: $receipt_status
      })
      WITH tx
      MERGE (from:Address {address: $from_address})
      MERGE (to:Address {address: $to_address})
      MERGE (from)-[:SENT]->(tx)
      MERGE (tx)-[:RECEIVED]->(to)
      RETURN tx`,
      {
        hash: transaction.hash,
        block_timestamp: transaction.block_timestamp,
        block_number: transaction.block_number,
        from_address: transaction.from_address,
        to_address: transaction.to_address,
        value: transaction.value,
        transaction_index: transaction.transaction_index || "0",
        gas: transaction.gas,
        gas_price: transaction.gas_price,
        input: transaction.input,
        receipt_cumulative_gas_used:
          transaction.receipt_cumulative_gas_used || "0",
        receipt_gas_used: transaction.receipt_gas_used || "0",
        receipt_status: transaction.receipt_status || "0",
      },
    );

    await session.close();

    return res.status(201).json({ message: "Transaction saved successfully" });
  } catch (error) {
    console.error("Error saving transaction:", error);
    return res.status(500).json({ error: "Failed to save transaction" });
  } finally {
    if (driver) {
      await driver.close();
    }
  }
}
