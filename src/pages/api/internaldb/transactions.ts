import type { NextApiRequest, NextApiResponse } from "next";
import { runQuery } from "./database-connection";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const {
    addressId,
    direction = "initial",
    index: transaction_index,
  } = req.query;

  if (!addressId || typeof addressId !== "string") {
    return res.status(400).json({ error: "Valid address required" });
  }

  console.log(
    `API Request: ${direction} for address ${addressId}, index: ${transaction_index}`,
  );

  try {
    let query;
    let params: any = { addressId };

    if (direction === "initial") {
      query = `
        MATCH (a:Address {addressId: $addressId})  
        OPTIONAL MATCH (a)-[outgoing:Transaction]->(receiver:Address)
        OPTIONAL MATCH (sender:Address)-[incoming:Transaction]->(a)
        WITH a, outgoing, receiver, incoming, sender
        WITH a, 
          COLLECT(CASE WHEN outgoing IS NOT NULL THEN {
            direction: "outgoing",
            sender: a.addressId,
            receiver: receiver.addressId,
            hash: outgoing.hash,  
            value: outgoing.value,
            input: outgoing.input,
            transaction_index: outgoing.transaction_index,
            gas: outgoing.gas,
            gas_used: outgoing.gas_used,
            gas_price: outgoing.gas_price,
            transaction_fee: outgoing.transaction_fee,
            block_number: outgoing.block_number,
            block_hash: outgoing.block_hash,
            block_timestamp: outgoing.block_timestamp
          } END) AS outTransactions,
          COLLECT(CASE WHEN incoming IS NOT NULL THEN {
            direction: "incoming",
            sender: sender.addressId,
            receiver: a.addressId,
            hash: incoming.hash,  
            value: incoming.value,
            input: incoming.input,
            transaction_index: incoming.transaction_index,
            gas: incoming.gas,
            gas_used: incoming.gas_used,
            gas_price: incoming.gas_price,
            transaction_fee: incoming.transaction_fee,
            block_number: incoming.block_number,
            block_hash: incoming.block_hash,
            block_timestamp: incoming.block_timestamp
          } END) AS inTransactions
        WITH a, 
          [tx IN outTransactions WHERE tx IS NOT NULL] + [tx IN inTransactions WHERE tx IS NOT NULL] AS allTransactions
        WITH a, allTransactions
        UNWIND CASE 
          WHEN size(allTransactions) > 0 THEN allTransactions 
          ELSE [null] 
        END AS tx
        WITH a, tx
        WHERE tx IS NOT NULL
        ORDER BY tx.transaction_index DESC, tx.transaction_index DESC
        WITH DISTINCT tx.hash AS hash, a, tx
        LIMIT 8
        WITH a, COLLECT(tx) AS orderedTransactions
        RETURN  
          a.addressId AS searched_address,  
          orderedTransactions AS transactions
      `;
    } else if (direction === "older") {
      query = `
        MATCH (a:Address {addressId: $addressId})  
        OPTIONAL MATCH (a)-[outgoing:Transaction]->(receiver:Address)
          WHERE outgoing.transaction_index < $transaction_index
        OPTIONAL MATCH (sender:Address)-[incoming:Transaction]->(a)
          WHERE incoming.transaction_index < $transaction_index
        WITH a, outgoing, receiver, incoming, sender
        WITH a, 
          COLLECT(CASE WHEN outgoing IS NOT NULL THEN {
            direction: "outgoing",
            sender: a.addressId,
            receiver: receiver.addressId,
            hash: outgoing.hash,  
            value: outgoing.value,
            input: outgoing.input,
            transaction_index: outgoing.transaction_index,
            gas: outgoing.gas,
            gas_used: outgoing.gas_used,
            gas_price: outgoing.gas_price,
            transaction_fee: outgoing.transaction_fee,
            block_number: outgoing.block_number,
            block_hash: outgoing.block_hash,
            block_timestamp: outgoing.block_timestamp
          } END) AS outTransactions,
          COLLECT(CASE WHEN incoming IS NOT NULL THEN {
            direction: "incoming",
            sender: sender.addressId,
            receiver: a.addressId,
            hash: incoming.hash,  
            value: incoming.value,
            input: incoming.input,
            transaction_index: incoming.transaction_index,
            gas: incoming.gas,
            gas_used: incoming.gas_used,
            gas_price: incoming.gas_price,
            transaction_fee: incoming.transaction_fee,
            block_number: incoming.block_number,
            block_hash: incoming.block_hash,
            block_timestamp: incoming.block_timestamp
          } END) AS inTransactions
        WITH a, 
          [tx IN outTransactions WHERE tx IS NOT NULL] + [tx IN inTransactions WHERE tx IS NOT NULL] AS allTransactions
        WITH a, allTransactions
        UNWIND CASE 
          WHEN size(allTransactions) > 0 THEN allTransactions 
          ELSE [null] 
        END AS tx
        WITH a, tx
        WHERE tx IS NOT NULL
        ORDER BY tx.transaction_index DESC, tx.transaction_index DESC
        WITH DISTINCT tx.hash AS hash, a, tx
        LIMIT 8
        WITH a, COLLECT(tx) AS orderedTransactions
        RETURN  
          a.addressId AS searched_address,  
          orderedTransactions AS transactions
      `;
      params.transaction_index = parseInt(transaction_index as string, 10);
    }

    if (!query) {
      return res.status(400).json({ error: "Invalid request direction" });
    }
    const records = await runQuery(query, params);
    return res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
