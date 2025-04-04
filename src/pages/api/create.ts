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
      if (table === "Collection" && (!data.name || !data.image)) {
        throw new Error("Name and image are required for Collection table");
      }

      let insertedData;

      // Insert data into Supabase
      if (table === "Asset") {
        const assetDataWithUserId = {
          ...data,
          creatorid: userId,
        };

        const { data: assetData, error: assetError } = await supabase
          .from("Asset")
          .insert([assetDataWithUserId]);

        if (assetError) throw assetError;
        insertedData = assetData;

        const walletData = {
          userid: userId,
          assetid: data.assetid,
          address: `addr_${userId}_${data.assetid}`,
          quantity: 1,
          lastupdated: new Date().toISOString(),
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
      } else if (table === "Collection") {
        const collectionDataWithUserId = {
          ...data,
          creatorid: userId,
        };

        const { data: collectionData, error: collectionError } = await supabase
          .from("Collection")
          .insert([collectionDataWithUserId]);

        if (collectionError) throw collectionError;
        insertedData = collectionData;
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