import { supabase } from '../../../lib/supabaseClient';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Fetch data from Supabase by joining Asset, PriceHistory, and Trade tables
      const { data, error } = await supabase
        .from('Trade')
        .select(`
          tradeid,
          status,
          Asset (symbol, name, assettype),
          PriceHistory!inner (price)
        `)
        .order('timestamp', { foreignTable: 'PriceHistory', ascending: false });

      if (error) {
        throw error;
      }

      // Map the fetched data to the desired structure
      const trades = data.map((trade: any) => ({
        tradeid: trade.tradeid,
        symbol: trade.Asset.symbol,
        name: trade.Asset.name,
        assettype: trade.Asset.assettype,
        price: trade.PriceHistory.price || 0, // Access price directly from the object
        status: trade.status,
      }));

      // Return the mapped data
      res.status(200).json({ trades });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}