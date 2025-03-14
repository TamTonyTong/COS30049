import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { table, data } = req.body;

    try {
      // Extract userId from the request headers
      const userId = req.headers['user-id'];
      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
      }

      // Validate data before insertion
      if (table === "Asset" && (!data.symbol || !data.name)) {
        throw new Error("Symbol and name are required for Asset table");
      }
      if (table === "PriceHistory" && (!data.assetid || !data.price || !data.currencypair)) {
        throw new Error("Asset ID, price, and currency pair are required for PriceHistory table");
      }

      let insertedData;

      // Insert data into Supabase
      if (table === "Asset") {
        // Add the userId to the data object for the Asset table (as creatorid)
        const assetDataWithUserId = {
          ...data,
          creatorid: userId, // Changed from userid to creatorid
        };

        const { data: assetData, error: assetError } = await supabase
          .from("Asset")
          .insert([assetDataWithUserId]);

        if (assetError) throw assetError;
        insertedData = assetData;

        // Insert into Wallet table with all required fields
        const walletData = {
          userid: userId, // The initial owner is the creator (this field name might still be correct depending on your schema)
          assetid: data.assetid,
          address: `addr_${userId}_${data.assetid}`, // Example address; adjust as needed
          nonce: 0, // Default nonce
          quantity: 1, // Default quantity
          lockedbalance: 0, // Default locked balance
          lastupdated: new Date().toISOString(), // Current timestamp
        };
        const { data: walletDataResult, error: walletError } = await supabase
          .from("Wallet")
          .insert([walletData])
          .select('walletid');

        if (walletError) throw walletError;
      } else if (table === "PriceHistory") {
        const { data: priceHistoryData, error: priceHistoryError } = await supabase
          .from("PriceHistory")
          .insert([data]);

        if (priceHistoryError) throw priceHistoryError;
        insertedData = priceHistoryData;
      } else {
        throw new Error("Unsupported table");
      }

      res.status(200).json({ success: true, data: insertedData });
    } catch (error) {
      console.error("Error inserting data into Supabase:", error);
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, error: "Method not allowed" });
  }
}