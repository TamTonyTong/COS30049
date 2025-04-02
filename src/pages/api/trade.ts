import { supabase } from '../../../lib/supabaseClient';
import { NextApiRequest, NextApiResponse } from 'next';
import { PostgrestError } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('Collection')
        .select(`
          collection_id,
          name,
          image,
          totalsupply,
          nftsforsale,
          createdat,
          creatorid,
          User!creatorid (
            metawallet
          ),
          Trade (
            tradeid,
            assetid,
            userid,
            pricehistoryid,
            status,
            txid,
            Asset (
              symbol,
              name,
              assettype,
              img,
              createdat,
              creatorid,
              User!Asset_creatorid_fkey (metawallet)
            ),
            User (metawallet),
            PriceHistory (price),
            walletid
          )
        `)
        .order('pricehistoryid', { foreignTable: 'Trade.PriceHistory', ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        return res.status(200).json({ collections: [] });
      }

      const collections = data.map((collection: any) => {
        if (!collection.User) {
          console.warn(`Collection ${collection.collection_id} is missing User data`);
        }

        // Handle both single Trade objects and arrays
        const trades = collection.Trade
          ? Array.isArray(collection.Trade)
            ? collection.Trade
            : [collection.Trade] // Convert single object to array
          : [];

        return {
          id: collection.collection_id,
          name: collection.name || 'Unknown',
          image: collection.image || null,
          totalsupply: collection.totalsupply || 0,
          nftsforsale: collection.nftsforsale || 0,
          createdat: collection.createdat || null,
          creatorWallet: collection.User?.metawallet || 'Unknown',
          trades: trades.map((trade: any) => {
            if (!trade.Asset) {
              console.warn(`Trade ${trade.tradeid} is missing Asset data`);
            }
            if (!trade.User) {
              console.warn(`Trade ${trade.tradeid} is missing User data`);
            }
            if (!trade.PriceHistory) {
              console.warn(`Trade ${trade.tradeid} is missing PriceHistory data`);
            }
            if (!trade.Asset?.User) {
              console.warn(`Trade ${trade.tradeid} is missing creator User data`);
            }

            return {
              tradeid: trade.tradeid,
              assetid: trade.assetid,
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
              createdat: trade.Asset?.createdat || null,
              creatorid: trade.Asset?.creatorid || null,
              creatorMetawallet: trade.Asset?.User?.metawallet || 'Unknown',
            };
          }),
        };
      });

      res.status(200).json({ collections });
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