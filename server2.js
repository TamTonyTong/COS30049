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
      neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD2),
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
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD2),
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
      // Initial load - get the most recent transactions
      // query = `
      //   MATCH (a:Address {addressId: $addressId})
      //   OPTIONAL MATCH (a)-[t]->(b:Address)
      //   WITH a, t, b
      //   ORDER BY t.transaction_index DESC
      //   LIMIT 8
      //   RETURN
      //   a.addressId AS searched_address,
      //   COLLECT(DISTINCT {
      //       receiver: b.addressId,
      //       hash: t.hash,
      //       value: t.value,
      //       input: t.input,
      //       transaction_index: t.transaction_index,
      //       gas: t.gas,
      //       gas_used: t.gas_used,
      //       gas_price: t.gas_price,
      //       transaction_fee: t.transaction_fee,
      //       block_number: t.block_number,
      //       block_hash: t.block_hash,
      //       block_timestamp: t.block_timestamp
      //   }) AS transactions;
      // `;
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
LIMIT 4
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
    } else if (direction === "newer") {
      console.log(`Processing newer request with index: ${transaction_index}`);
      // Load newer transactions (higher timestamp)
      query = `
        MATCH (a:Address {addressId: $addressId})  
        OPTIONAL MATCH (a)-[r1]->(t:Transaction)-[r2]->(b:Address)
        WHERE t.transaction_index > $transaction_index
        WITH a, t, b  
        ORDER BY t.transaction_index ASC
        LIMIT 4
        RETURN  
        a.addressId AS searched_address,  
        COLLECT(DISTINCT {
            receiver: b.addressId,
            hash: t.hash,  
            value: t.value,
            input: t.input,
            transaction_index: t.transaction_index,
            gas: t.gas,
            gas_used: t.gas_used,
            gas_price: t.gas_price,
            transaction_fee: t.transaction_fee,
            block_number: t.block_number,
            block_hash: t.block_hash,
            block_timestamp: t.block_timestamp
        }) AS transactions;
      `;
      params.transaction_index = parseInt(transaction_index, 10);
    }
    const result = await session.run(query, params);

    // For "newer" direction, reverse the order to maintain chronological display
    if (direction === "newer") {
      result.records.forEach((record) => {
        const transactions = record.get("transactions");
        transactions.reverse();
      });
    }
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

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
