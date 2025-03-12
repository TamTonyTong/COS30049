import neo4j, { Driver } from "neo4j-driver";

let DbDriver: Driver | null = null;

export function getDbDriver() {
  if (!DbDriver) {
    DbDriver = neo4j.driver(
      process.env.NEXT_PUBLIC_NEO4J_URI2 || "",
      neo4j.auth.basic(
        process.env.NEXT_PUBLIC_NEO4J_USER || "",
        process.env.NEXT_PUBLIC_NEO4J_PASSWORD2 || "",
      ),
      {
        // Add this configuration to convert JavaScript numbers to Neo4j integers
        disableLosslessIntegers: true,
      },
    );
  }
  return DbDriver;
}

export async function closeEtherscanDriver() {
  if (DbDriver) {
    await DbDriver.close();
    DbDriver = null;
  }
}

export async function runQuery(cypher: string, params = {}) {
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

  const session = getDbDriver().session();
  try {
    const result = await session.run(cypher, processedParams);
    return result.records.map((record) => record.toObject());
  } finally {
    await session.close();
  }
}
