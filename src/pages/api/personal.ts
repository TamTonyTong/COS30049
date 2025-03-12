import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient';

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
        .eq('userid', userId) // Filter by the logged-in user's ID
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
        .select('assetid, symbol')
        .in('assetid', assetIds);

      if (assetError) throw assetError;

      // Fetch latest prices for the assets
      const { data: priceHistoryData, error: priceHistoryError } = await supabase
        .from('PriceHistory')
        .select('assetid, price')
        .in('assetid', assetIds)
        .order('timestamp', { ascending: false });

      if (priceHistoryError) throw priceHistoryError;

      // Combine wallet, asset, and price data
      const assets = walletData.map((wallet) => {
        const asset = assetData.find((a) => a.assetid === wallet.assetid);
        const price = priceHistoryData.find((p) => p.assetid === wallet.assetid)?.price || 0;
        return {
          name: asset?.symbol || "Unknown",
          quantity: wallet.quantity,
          price: price,
          totalValue: wallet.quantity * price,
        };
      });

      // Fetch transaction data for the user
      const { data: transactionData, error: transactionError } = await supabase
        .from('Transaction')
        .select('txid, type, amount, status, creationtimestamp')
        .eq('userid', userId);

      if (transactionError) throw transactionError;

      // Prepare response
      const responseData = {
        balance: userData.balance,
        assets: assets,
        transactions: transactionData,
      };

      console.log('Fetched data from Supabase:', responseData);
      res.status(200).json(responseData);
    }

    // Handle POST request (deposit)
    if (req.method === 'POST') {
      const { amount } = req.body; // Extract deposit amount from request body

      // Fetch the user's data from the User table
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('userid, balance')
        .eq('userid', userId) // Filter by the logged-in user's ID
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