export async function fetchTransactions(
  addressId: string,
  direction: "initial" | "older" | "newer" = "initial",
  transaction_index?: number,
) {
  try {
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
