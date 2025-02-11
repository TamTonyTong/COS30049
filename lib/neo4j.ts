// lib/neo4j.ts
import neo4j from "neo4j-driver";

const uri = "bolt://localhost:7687"; // Replace with your Neo4j URI
const user = "neo4j"; // Replace with your Neo4j username
const password = "12345678"; // Replace with your Neo4j password

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

export default driver;