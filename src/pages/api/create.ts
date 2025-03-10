import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { table, data } = req.body;

    try {
      // Validate data before insertion
      if (table === "Asset" && (!data.symbol || !data.name)) {
        throw new Error("Symbol and name are required for Asset table");
      }
      if (table === "PriceHistory" && (!data.assetid || !data.price || !data.currencypair)) {
        throw new Error("Asset ID, price, and currency pair are required for PriceHistory table");
      }

      // Insert data into Supabase
      const { data: insertedData, error } = await supabase
        .from(table)
        .insert([data]);

      if (error) throw error;

      res.status(200).json({ success: true, data: insertedData });
    } catch (error) {
      console.error("Error inserting data into Supabase:", error);
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, error: "Method not allowed" });
  }
}