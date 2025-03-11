require("dotenv").config();
const express = require("express");
const cors = require("cors");
const neo4j = require("neo4j-driver");

const app = express();
app.use(cors());
app.use(express.json());

(async () => {
  let driver;

  try {
    driver = neo4j.driver(
      process.env.NEO4J_URI2,
      neo4j.auth.basic(
        process.env.NEXT_PUBLIC_NEO4J_USER,
        process.env.NEO4J_PASSWORD2,
      ),
    );
    const serverInfo = await driver.getServerInfo();
    console.log("Connection established");
    console.log(serverInfo);
  } catch (err) {
    console.log(`Connection error\n${err}\nCause: ${err.cause}`);
  }
})();

// Get One-Hop Transactions for an Address
app.get("/transactions/:addressId", async (req, res) => {
  driver = neo4j.driver(
    process.env.NEO4J_URI2,
    neo4j.auth.basic(
      process.env.NEXT_PUBLIC_NEO4J_USER,
      process.env.NEO4J_PASSWORD2,
    ),
  );
  const { addressId } = req.params;
  const direction = req.query.direction || "initial"; // "initial", "older", or "newer"
  const transaction_index = req.query.index || null;

  console.log(
    `API Request: ${direction} for address ${addressId}, index: ${transaction_index}`,
  );
  const session = driver.session();
  try {
    let query;
    let params = { addressId };
    if (direction === "initial") {
      query = `
        MATCH (a:Address {addressId: $addressId})  
        OPTIONAL MATCH (a)-[outgoing:Transaction]->(receiver:Address)
        OPTIONAL MATCH (sender:Address)-[incoming:Transaction]->(a)
        WITH a, 
          outgoing, receiver, 
          incoming, sender
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
    orderedTransactions AS transactions;
      `;
    } else if (direction === "older") {
      console.log(`Processing older request with index: ${transaction_index}`);
      // Load older transactions (lower timestamp)
      query = `
        MATCH (a:Address {addressId: $addressId})  
OPTIONAL MATCH (a)-[outgoing:Transaction]->(receiver:Address)
WHERE outgoing.transaction_index < $transaction_index
OPTIONAL MATCH (sender:Address)-[incoming:Transaction]->(a)
WHERE incoming.transaction_index < $transaction_index
WITH a, 
     outgoing, receiver, 
     incoming, sender
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
    orderedTransactions AS transactions;
      `;
      params.transaction_index = parseInt(transaction_index, 10);
    }
    const result = await session.run(query, params);

    console.log(transaction_index);
    console.log(result);

    res.json(result.records.map((record) => record.toObject()));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await session.close();
  }
});
// Get Transaction by Hash
app.get("/transaction/:hash", async (req, res) => {
  driver = neo4j.driver(
    process.env.NEO4J_URI2,
    neo4j.auth.basic(
      process.env.NEXT_PUBLIC_NEO4J_USER,
      process.env.NEO4J_PASSWORD2,
    ),
  );
  const { hash } = req.params;
  console.log(`API Request: Search for transaction hash ${hash}`);

  const session = driver.session();
  try {
    const query = `
      MATCH (sender:Address)-[tx:Transaction {hash: $hash}]->(receiver:Address)
      RETURN {
        hash: tx.hash,
        sender: sender.addressId,
        receiver: receiver.addressId,
        direction: "outgoing", // From the perspective of sender
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

    const result = await session.run(query, { hash });

    if (result.records.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const transaction = result.records[0].get("transaction");
    res.json({ transaction });
  } catch (error) {
    console.error("Error fetching transaction by hash:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await session.close();
  }
});
// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
