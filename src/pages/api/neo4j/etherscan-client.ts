import neo4j from "neo4j-driver";
import * as dotenv from "dotenv";

dotenv.config();

let etherscanDriver: neo4j.Driver | null = null;

export function getEtherscanDriver() {
  if (!etherscanDriver) {
    etherscanDriver = neo4j.driver(
      process.env.NEXT_PUBLIC_NEO4J_URI3 || "",
      neo4j.auth.basic(
        process.env.NEXT_PUBLIC_NEO4J_USER || "",
        process.env.NEXT_PUBLIC_NEO4J_PASSWORD3 || "",
      ),
      {
        // Add this configuration to convert JavaScript numbers to Neo4j integers
        disableLosslessIntegers: true,
      },
    );
  }
  return etherscanDriver;
}

export async function closeEtherscanDriver() {
  if (etherscanDriver) {
    await etherscanDriver.close();
    etherscanDriver = null;
  }
}

export async function runEtherscanQuery(cypher: string, params = {}) {
  // Convert any number parameters to integers for Neo4j
  const processedParams = Object.entries(params).reduce(
    (acc, [key, value]) => {
      if (typeof value === "number") {
        // Ensure number parameters are converted to integers for Neo4j
        acc[key] = neo4j.int(Math.floor(value));
      } else {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  const session = getEtherscanDriver().session();
  try {
    const result = await session.run(cypher, processedParams);
    return result.records.map((record) => record.toObject());
  } finally {
    await session.close();
  }
}
