import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (req.method === 'GET') {
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('userid, balance')
        .eq('userid', userId)
        .single();

      if (userError) throw userError;

      const { data: walletData, error: walletError } = await supabase
        .from('Wallet')
        .select('quantity, assetid')
        .eq('userid', userId);

      if (walletError) throw walletError;

      const assetIds = walletData.map((wallet) => wallet.assetid);
      const { data: assetData, error: assetError } = await supabase
        .from('Asset')
        .select('assetid, symbol, name, img, collection_id') // Added collection_id
        .in('assetid', assetIds);

      if (assetError) throw assetError;

      const { data: priceHistoryData, error: priceHistoryError } = await supabase
        .from('PriceHistory')
        .select('assetid, price')
        .in('assetid', assetIds)
        .order('timestamp', { ascending: false });

      if (priceHistoryError) throw priceHistoryError;

      const { data: tradeData, error: tradeError } = await supabase
        .from('Trade')
        .select('assetid')
        .eq('userid', userId)
        .eq('status', 'Buy');

      if (tradeError) throw tradeError;

      const listedAssetIds = new Set(tradeData.map((trade) => trade.assetid));

      const assets = walletData.map((wallet) => {
        const asset = assetData.find((a) => a.assetid === wallet.assetid);
        const price = priceHistoryData.find((p) => p.assetid === wallet.assetid)?.price || 0;
        return {
          name: asset?.name || "Unknown",
          symbol: asset?.symbol || "N/A",
          img: asset?.img || null,
          quantity: wallet.quantity,
          price: price,
          totalValue: wallet.quantity * price,
          assetid: wallet.assetid,
          collection_id: asset?.collection_id || null, // Include collection_id
          isSelling: listedAssetIds.has(wallet.assetid),
        };
      });

      const { data: transactionData, error: transactionError } = await supabase
        .from('Transaction')
        .select('txid, type, amount, status, timestamp, assetid')
        .eq('userid', userId);

      if (transactionError) throw transactionError;

      const transactionAssetIds = transactionData
        .filter((tx) => tx.assetid)
        .map((tx) => tx.assetid);
      const { data: transactionAssetData, error: transactionAssetError } = await supabase
        .from('Asset')
        .select('assetid, symbol, name')
        .in('assetid', transactionAssetIds);

      if (transactionAssetError) throw transactionAssetError;

      const transactionsWithAssets = transactionData.map((tx) => {
        const asset = transactionAssetData?.find((a) => a.assetid === tx.assetid);
        if (!tx.txid) {
          tx.txid = uuidv4();
        }
        return {
          id: tx.txid,
          timestamp: new Date(tx.timestamp).toISOString(),
          type: tx.type,
          amount: tx.amount,
          status: tx.status,
          assetid: tx.assetid,
          symbol: asset?.symbol || "N/A",
          name: asset?.name || "Unknown",
        };
      });

      const responseData = {
        publicaddress: userData.userid,
        balance: userData.balance,
        assets: assets,
        transactions: transactionsWithAssets,
      };

      res.status(200).json(responseData);
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' });
  }
}
