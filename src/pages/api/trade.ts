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
          txid,
          Asset (symbol, name, assettype),
          User (metawallet),
          PriceHistory (price),
          walletid
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
        metawallet: trade.User?.metawallet || '',
        pricehistoryid: trade.pricehistoryid,
        walletid: trade.walletid,
        txid: trade.txid,  // Include txid in the response
      }));

      res.status(200).json({ trades });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}