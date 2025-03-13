import { supabase } from '../../../lib/supabaseClient';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('Trade')
        .select(`
          tradeid,
          userid,
          pricehistoryid,
          status,
          Asset (symbol, name, assettype),
          User (walletid),
          PriceHistory (price)
        `)
        .order('pricehistoryid', { ascending: false });

      if (error) throw error;

      const trades = data.map((trade: any) => ({
        tradeid: trade.tradeid,
        symbol: trade.Asset.symbol,
        name: trade.Asset.name,
        assettype: trade.Asset.assettype,
        price: trade.PriceHistory?.price || 0,
        status: trade.status,
        userid: trade.userid,
        walletid: trade.User?.walletid || '',
        pricehistoryid: trade.pricehistoryid
      }));

      res.status(200).json({ trades });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}