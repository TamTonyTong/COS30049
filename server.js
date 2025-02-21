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
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
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
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
  );
  const { addressId } = req.params;
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (a:Address {addressId: $addressId})  
      OPTIONAL MATCH (a)-[r1]->(t:Transaction)-[r2]->(b:Address)  
      WITH a, t, b  
      ORDER BY t.transaction_index DESC  // Sort transactions by latest timestamp  
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
      `,
      { addressId },
    );
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
