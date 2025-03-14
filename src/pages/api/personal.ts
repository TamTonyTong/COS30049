import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid'; // For generating UUIDs if needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API route invoked');

  try {
    // Extract userid from the request headers (passed from the frontend)
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Handle GET request (fetch data)
    if (req.method === 'GET') {
      // Fetch the user's data from the User table
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('userid, balance')
        .eq('userid', userId)
        .single();

      if (userError) throw userError;

      // Fetch wallet data for the user
      const { data: walletData, error: walletError } = await supabase
        .from('Wallet')
        .select('quantity, assetid')
        .eq('userid', userId);

      if (walletError) throw walletError;

      // Fetch asset details for the assets in the wallet
      const assetIds = walletData.map((wallet) => wallet.assetid);
      const { data: assetData, error: assetError } = await supabase
        .from('Asset')
        .select('assetid, symbol, name, img')
        .in('assetid', assetIds);

      if (assetError) throw assetError;

      // Fetch latest prices for the assets
      const { data: priceHistoryData, error: priceHistoryError } = await supabase
        .from('PriceHistory')
        .select('assetid, price')
        .in('assetid', assetIds)
        .order('timestamp', { ascending: false });

      if (priceHistoryError) throw priceHistoryError;

      // Fetch trades to determine which assets are listed for sale
      const { data: tradeData, error: tradeError } = await supabase
        .from('Trade')
        .select('assetid')
        .eq('userid', userId)
        .eq('status', 'Buy');

      if (tradeError) throw tradeError;

      // Create a set of asset IDs that are currently listed for sale
      const listedAssetIds = new Set(tradeData.map((trade) => trade.assetid));

      // Combine wallet, asset, and price data with selling status
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
          isSelling: listedAssetIds.has(wallet.assetid),
        };
      });

      // Fetch transaction data for the user, including assetid
      const { data: transactionData, error: transactionError } = await supabase
        .from('Transaction')
        .select('txid, type, amount, status, timestamp, assetid')
        .eq('userid', userId);

      if (transactionError) throw transactionError;

      // Fetch asset details for transactions (if assetid exists)
      const transactionAssetIds = transactionData
        .filter((tx) => tx.assetid)
        .map((tx) => tx.assetid);
      const { data: transactionAssetData, error: transactionAssetError } = await supabase
        .from('Asset')
        .select('assetid, symbol, name')
        .in('assetid', transactionAssetIds);

      if (transactionAssetError) throw transactionAssetError;

      // Map transactions to include asset details and ensure txid
      const transactionsWithAssets = transactionData.map((tx) => {
        const asset = transactionAssetData?.find((a) => a.assetid === tx.assetid);
        if (!tx.txid) {
          console.warn(`Transaction with missing txid for user ${userId}:`, tx);
          tx.txid = uuidv4(); // Fallback to a generated UUID (shouldn't happen after DB fix)
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

      // Prepare response
      const responseData = {
        publicaddress: userData.userid,
        balance: userData.balance,
        assets: assets,
        transactions: transactionsWithAssets,
      };

      console.log('Fetched data from Supabase:', responseData);
      res.status(200).json(responseData);
    }

    // Handle POST request (deposit)
    if (req.method === 'POST') {
      const { amount } = req.body;

      // Fetch the user's data from the User table
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('userid, balance')
        .eq('userid', userId)
        .single();

      if (userError) throw userError;

      // Call the increment_balance function
      const { data: updatedBalance, error: rpcError } = await supabase
        .rpc('increment_balance', { user_id: userId, amount: Number(amount) });

      if (rpcError) throw rpcError;

      console.log('Updated balance:', updatedBalance);
      res.status(200).json({ balance: updatedBalance });
    }
  } catch (error) {
    console.error('Error in API route:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
}