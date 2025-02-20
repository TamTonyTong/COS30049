require("dotenv").config();
const express = require("express");
const cors = require("cors");
const neo4j = require("neo4j-driver");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to Neo4j Database
const driver = neo4j.driver(
  //   process.env.NEO4J_URI, // Neo4j connection string
  "bolt://127.0.0.1:7687", // Force IPv4
  //   neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),

  neo4j.auth.basic("neo4j", "12345678"),
);

// Get One-Hop Transactions for an Address
app.get("/transactions/:addressId", async (req, res) => {
  const { addressId } = req.params;
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (a:Address {addressId: $addressId})  
      OPTIONAL MATCH (a)-[r1]->(t:Transaction)-[r2]->(b:Address)  
      RETURN 
          a.addressId AS searched_address,
          COLLECT(DISTINCT {
              transaction_id: t.block_hash,  
              transaction_fee: t.transaction_fee,  
              gas_price: t.gas_price,  
              gas_used: t.gas_used,  
              value: t.value,  
              block_timestamp: t.block_timestamp,  
              receiver: b.addressId
          }) AS transactions
      LIMIT 8;
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
