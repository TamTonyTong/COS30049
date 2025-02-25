export async function fetchTransactions(
  addressId: string,
  direction: "initial" | "older" | "newer" = "initial",
  timestamp?: number,
) {
  try {
    let url = `http://localhost:5001/transactions/${addressId}`;

    // Add query parameters for pagination
    if (direction !== "initial" && timestamp) {
      url += `?direction=${direction}&timestamp=${timestamp}`;
    } else if (direction !== "initial") {
      url += `?direction=${direction}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch transactions");
    console.log(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}
