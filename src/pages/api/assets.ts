import { supabase } from '../../../lib/supabaseClient';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Fetch data from Supabase by joining Asset and PriceHistory tables
      const { data: supabaseData, error } = await supabase
        .from('Asset') // Start with the Asset table
        .select(`
          symbol,
          name,
          assettype,
          PriceHistory (price, currencypair, timestamp)
        `)
        .order('timestamp', { foreignTable: 'PriceHistory', ascending: false }); // Order by latest price

      if (error) {
        throw error;
      }

      // Map the fetched data to the desired structure
      const assets = supabaseData.map((asset: any) => ({
        symbol: asset.symbol,
        name: asset.name,
        assettype: asset.assettype,
        price: asset.PriceHistory[0]?.price || 0, // Latest price
        currencypair: asset.PriceHistory[0]?.currencypair || 'N/A', // Latest currency pair
      }));

      // Return the mapped data
      res.status(200).json({ assets });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}