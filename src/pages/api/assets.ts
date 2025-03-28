import { supabase } from '../../../lib/supabaseClient';
import { NextApiRequest, NextApiResponse } from 'next';

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
          createdat,
          creatorid,
          User!creatorid (
            metawallet
          ),
          Asset (
            assetid,
            creatorid,
            symbol,
            name,
            assettype,
            createdat,
            img,
            PriceHistory (
              price,
              pricehistoryid,
              currencypair,
              timestamp
            ),
            Wallet (
              userid
            )
          )
        `)
        .order('timestamp', { foreignTable: 'Asset.PriceHistory', ascending: false });

      if (error) throw error;

      const collections = data.map((collection: any) => ({
        id: collection.collection_id,
        name: collection.name || 'Unknown',
        image: collection.image || null,
        totalsupply: collection.totalsupply || 0,
        createdat: collection.createdat || null, // Include createdat
        creatorWallet: collection.User?.metawallet || 'Unknown', // Include creator's wallet address
        assets: collection.Asset.map((asset: any) => ({
          assetid: asset.assetid,
          creatorid: asset.creatorid,
          ownerid: asset.Wallet && asset.Wallet.length > 0 ? asset.Wallet[0].userid : '',
          symbol: asset.symbol || 'N/A',
          name: asset.name || 'Unknown',
          assettype: asset.assettype || 'Unknown',
          price: asset.PriceHistory && asset.PriceHistory.length > 0 ? asset.PriceHistory[0].price : 0,
          currencypair: asset.PriceHistory && asset.PriceHistory.length > 0 ? asset.PriceHistory[0].currencypair || `${asset.symbol || 'N/A'}/ETH` : `${asset.symbol || 'N/A'}/ETH`,
          createdat: asset.createdat || null,
          img: asset.img || null,
        })),
      }));

      res.status(200).json({ collections });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}