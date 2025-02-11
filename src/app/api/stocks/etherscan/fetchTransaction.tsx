import axios from 'axios';

const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
const ETHERSCAN_URL = "https://api.etherscan.io/api";

const fetchTransactions = async (address: string) => {
  try {
    const response = await axios.get(ETHERSCAN_URL, {
      params: {
        module: "account",
        action: "txlist",
        address: address,
        startblock: 21782475,
        endblock: 21782460,
        page: 1,
        offset: 10,
        sort: "desc",
        apikey: ETHERSCAN_API_KEY,
      },
    });

    if (response.data.status === "1") {
      const transactions = response.data.result;
      const edges = transactions.map((tx: any) => ({
        from: tx.from,
        to: tx.to,
      }));

      return edges;  // Returns an array of transactions as edges
    } else {
      console.error("Error fetching transactions:", response.data.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};