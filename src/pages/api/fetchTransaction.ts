export async function fetchTransactions(
  addressId: string,
  direction: "initial" | "older" | "newer" = "initial",
  transaction_index?: number,
) {
  try {
    console.log(`Fetching transactions for address: ${addressId}`);
    let url = `http://localhost:5001/transactions/${addressId}`;

    // Add query parameters for pagination
    if (direction !== "initial" && transaction_index !== undefined) {
      url += `?direction=${direction}&index=${transaction_index}`;
    } else if (direction !== "initial") {
      url += `?direction=${direction}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch transactions");

    const data = await response.json();
    console.log("Raw response data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}
export async function fetchTransactionByHash(hash: string) {
  try {
    console.log(`Fetching transaction with hash: ${hash}`);
    const url = `http://localhost:5001/transaction/${hash}`;

    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        console.log("Transaction not found");
        return null;
      }
      throw new Error("Failed to fetch transaction");
    }

    const data = await response.json();
    console.log("Transaction data:", data);
    return data.transaction;
  } catch (error) {
    console.error("Error fetching transaction by hash:", error);
    return null;
  }
}
