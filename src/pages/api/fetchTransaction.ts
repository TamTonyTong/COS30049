// Update the fetchTransactions function
export async function fetchTransactions(
  address: string,
  direction: string,
  transactionIndex?: string,
) {
  try {
    console.log(
      `Fetching transactions for ${address}, direction: ${direction}`,
    );

    let url = `/api/internaldb/transactions?addressId=${address}&direction=${direction}`;
    if (transactionIndex) {
      url += `&index=${transactionIndex}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

// Update the fetchTransactionByHash function
export async function fetchTransactionByHash(hash: string) {
  try {
    console.log(`Fetching transaction with hash: ${hash}`);
    const url = `/api/internaldb/transaction-by-hash?hash=${hash}`;

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
