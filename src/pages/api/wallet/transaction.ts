import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: "Address is required" });
  }

  try {
    const response = await axios.get("https://api.etherscan.io/api", {
      params: {
        module: "account",
        action: "txlist",
        address,
        startblock: 0,
        endblock: 99999999,
        page: req.query.page || 1,
        offset: req.query.offset || 10,
        sort: "desc",
        apikey: process.env.ETHERSCAN_API_KEY,
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
}
