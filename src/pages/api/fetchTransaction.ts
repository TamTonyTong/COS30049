export async function fetchTransactions(addressId: string, hop: number = 1) {
  try {
    const response = await fetch(
      // `http://localhost:5000/transactions/${addressId}?hop=${hop}`,
      `http://localhost:5000/transactions/${addressId}`,
    );
    if (!response.ok) throw new Error("Failed to fetch transactions");
    console.log(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}
