// src/pages/api/neo4j/etherscan-transactions.ts
import { runEtherscanQuery } from "./etherscan-client";
import { Transaction } from "@/src/components/transactionexplorer/type";

export async function storeEtherscanTransactions(
  transactions: Transaction[],
  address: string,
): Promise<void> {
  // Create or ensure the main Address node exists
  await runEtherscanQuery(
    `
    MERGE (a:Address {addressId: $address})
    RETURN a
  `,
    { address },
  );

  // For each transaction, create the transaction and connect to sender/receiver
  for (const tx of transactions) {
    const params = {
      txHash: tx.hash,
      value: tx.value.toString(),
      input: tx.input || 0,
      gas: tx.gas || 0,
      gasUsed: tx.gas_used || 0,
      gasPrice: tx.gas_price || 0,
      txFee: tx.transaction_fee || 0,
      blockNumber: tx.block_number || 0,
      txIndex: tx.transaction_index,
      blockHash: tx.block_hash || "",
      timestamp: tx.block_timestamp,
      from: tx.sender,
      to: tx.receiver || address,
    };

    // Create transaction and connect to addresses
    await runEtherscanQuery(
      `
      // Create or get sender address
      MERGE (sender:Address {addressId: $from})
      
      // Create or get receiver address 
      MERGE (receiver:Address {addressId: $to})
      
      // Create transaction if it doesn't exist
      MERGE (tx:Transaction {hash: $txHash})
      ON CREATE SET
        tx.value = $value,
        tx.input = $input,
        tx.gas = $gas,
        tx.gas_used = $gasUsed,
        tx.gas_price = $gasPrice,
        tx.transaction_fee = $txFee,
        tx.block_number = $blockNumber,
        tx.transaction_index = $txIndex,
        tx.block_hash = $blockHash,
        tx.block_timestamp = $timestamp
      
      // Create relationships
      MERGE (sender)-[out:SENT]->(tx)
      MERGE (tx)-[in:RECEIVED]->(receiver)
    `,
      params,
    );
  }
}

export async function getEtherscanTransactionsFromNeo4j(
  address: string,
  page: number = 1,
  offset: number = 8,
): Promise<Transaction[]> {
  // Ensure these are integers
  const skip = Math.floor((page - 1) * offset);
  const limit = Math.floor(offset);

  const result = await runEtherscanQuery(
    `
    MATCH (a:Address {addressId: $address})
    
    // Outgoing transactions
    OPTIONAL MATCH (a)-[:SENT]->(outgoing:Transaction)-[:RECEIVED]->(receiver:Address)
    
    // Incoming transactions
    OPTIONAL MATCH (sender:Address)-[:SENT]->(incoming:Transaction)-[:RECEIVED]->(a)
    
    WITH a, outgoing, receiver, incoming, sender
    
    // Collect outgoing transactions
    WITH a, 
      COLLECT(CASE WHEN outgoing IS NOT NULL THEN {
         direction: "outgoing",
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
         block_timestamp: outgoing.block_timestamp,
         sender: a.addressId
      } END) AS outTransactions,
      
      // Collect incoming transactions
      COLLECT(CASE WHEN incoming IS NOT NULL THEN {
         direction: "incoming",
         sender: sender.addressId,
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
         block_timestamp: incoming.block_timestamp,
         receiver: a.addressId
      } END) AS inTransactions
      
    // Combine and filter null values
    WITH [tx IN outTransactions WHERE tx IS NOT NULL] + [tx IN inTransactions WHERE tx IS NOT NULL] AS allTransactions
    
    // Sort by timestamp or transaction_index
    UNWIND allTransactions AS tx
    WITH tx ORDER BY tx.block_timestamp DESC
    
    // Apply pagination - using integer parameters for SKIP and LIMIT
    SKIP $skip LIMIT $limit
    
    RETURN tx as transaction
  `,
    { address, skip, limit },
  );

  return result.map(
    (record: { transaction: Transaction }) => record.transaction as Transaction,
  );
}
