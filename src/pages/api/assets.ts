import { supabase } from '../../../lib/supabaseClient';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('Asset')
        .select(`
          assetid,
          creatorid,
          symbol,
          name,
          assettype,
          createdat,
          PriceHistory (
            price,
            pricehistoryid
          ),
          Wallet (
            userid
          )
        `);

      if (error) throw error;

      const assets = data.map((asset: any) => ({
        assetid: asset.assetid,
        creatorid: asset.creatorid, // Map database userid to creatorid in the response
        ownerid: asset.Wallet && asset.Wallet.length > 0 ? asset.Wallet[0].userid : '', // Handle Wallet array
        symbol: asset.symbol || 'N/A',
        name: asset.name || 'Unknown',
        assettype: asset.assettype || 'Unknown',
        price: asset.PriceHistory && asset.PriceHistory.length > 0 ? asset.PriceHistory[0].price : 0,
        currencypair: `${asset.symbol || 'N/A'}/ETH`,
        createdat: asset.createdat || null,
      }));

      res.status(200).json({ assets });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}