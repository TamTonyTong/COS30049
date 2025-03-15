import { supabase } from '../../../lib/supabaseClient';
import { NextApiRequest, NextApiResponse } from 'next';
import { PostgrestError } from '@supabase/supabase-js';

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
          Asset (symbol, name, assettype, img),
          User (metawallet),
          PriceHistory (price),
          walletid
        `)
        .order('pricehistoryid', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        return res.status(200).json({ trades: [] });
      }

      const trades = data.map((trade: any) => {
        // Log the trade for debugging
        if (!trade.Asset) {
          console.warn(`Trade ${trade.tradeid} is missing Asset data`);
        }
        if (!trade.User) {
          console.warn(`Trade ${trade.tradeid} is missing User data`);
        }
        if (!trade.PriceHistory) {
          console.warn(`Trade ${trade.tradeid} is missing PriceHistory data`);
        }

        return {
          tradeid: trade.tradeid,
          symbol: trade.Asset?.symbol || 'N/A',
          name: trade.Asset?.name || 'Unknown',
          img: trade.Asset?.img || null,
          assettype: trade.Asset?.assettype || 'Unknown',
          price: trade.PriceHistory?.price || 0,
          status: trade.status,
          userid: trade.userid,
          metawallet: trade.User?.metawallet || '',
          pricehistoryid: trade.pricehistoryid,
          walletid: trade.walletid,
          txid: trade.txid,
        };
      });

      res.status(200).json({ trades });
    } catch (error) {
      console.error('Error in /api/trade:', error);
      const errorMessage = error instanceof Error || error instanceof PostgrestError
        ? error.message
        : 'An unexpected error occurred';
      res.status(500).json({ message: 'Internal server error', error: errorMessage });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}