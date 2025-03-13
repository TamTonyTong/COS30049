'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { validate } from 'uuid';

// No props needed since we're reading userId from query
export default function SellConfirmPage() {
  const searchParams = useSearchParams();
  const name = searchParams?.get('name');
  const price = searchParams?.get('price');
  const userId = searchParams?.get('userId'); // Read userId from query
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug the initial values
  useEffect(() => {
    console.log('Debugging initial values:');
    console.log('searchParams:', searchParams);
    console.log('name:', name);
    console.log('price:', price);
    console.log('userId:', userId);
  }, [searchParams, name, price, userId]);

  // Handle the sell action
  const handleSell = async () => {
    setLoading(true);
    setError(null);
  
    try {
      // Validate userId
      if (!userId || !validate(userId)) {
        console.error('Invalid userId:', userId);
        throw new Error('Invalid user ID. Please log in again.');
      }
  
      console.log('Fetching wallet data for user:', userId);
  
      // Fetch wallet data
      const { data: walletData, error: walletError } = await supabase
        .from('Wallet')
        .select('walletid, assetid')
        .eq('userid', userId)
        .single();
  
      if (walletError || !walletData) {
        console.error('Error fetching wallet data:', walletError || 'No wallet found for user');
        throw new Error('Wallet not found for user');
      }
  
      const { assetid, walletid } = walletData;
  
      console.log('Fetched wallet data:', walletData);
  
      // Verify the assetid matches the asset symbol
      console.log('Verifying asset with assetid:', assetid, 'and symbol:', name);
      const { data: assetData, error: assetError } = await supabase
        .from('Asset')
        .select('assetid, symbol')
        .eq('assetid', assetid)
        .eq('symbol', name)
        .single();
  
      if (assetError || !assetData) {
        console.error('Error verifying asset:', assetError || 'Asset not found');
        const { data: allAssets, error: allAssetsError } = await supabase
          .from('Asset')
          .select('assetid, name, symbol');
        console.log('All assets in Asset table:', allAssets, 'Error:', allAssetsError);
        throw new Error('Asset not found or does not match the provided symbol');
      }
  
      console.log('Verified asset:', assetData);
  
      // Fetch the latest pricehistoryid
      const { data: priceHistoryData, error: priceHistoryError } = await supabase
        .from('PriceHistory')
        .select('pricehistoryid')
        .eq('assetid', assetid)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();
  
      if (priceHistoryError || !priceHistoryData) {
        console.error('Error fetching price history data:', priceHistoryError || 'No price history found');
        throw new Error('No price history found for the asset');
      }
  
      const { pricehistoryid } = priceHistoryData;
  
      console.log('Fetched price history data:', priceHistoryData);
  
      // Validate all UUIDs
      if (
        !validate(assetid) ||
        !validate(userId) ||
        !validate(pricehistoryid) ||
        !validate(walletid)
      ) {
        console.error('Invalid UUID in trade data:', { assetid, userId, pricehistoryid, walletid });
        throw new Error('Invalid UUID in trade data');
      }
  
      // Prepare trade data
      const tradeData = {
        assetid,
        userid: userId,
        status: 'Buy', // Set to 'Buy' for initial listing
        pricehistoryid,
        walletid,
      };
  
      // Log the trade data before inserting
      console.log('Inserting trade data:', JSON.stringify(tradeData, null, 2));
  
      // Insert into Trade table
      const { data, error } = await supabase
        .from('Trade')
        .insert([tradeData]);
  
      if (error) {
        console.error('Supabase insert error:', error.message, error.code, error.details, error);
        throw error;
      }
  
      console.log('Trade data inserted successfully:', data);
  
      // Navigate to markets page
      window.location.href = '/markets';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to add trade data:', errorMessage, error);
      setError(`Failed to add trade data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Loading state with inline debugging
  if (!searchParams || !name || !price || !userId) {
    console.log('Loading... due to:', {
      searchParams,
      name,
      price,
      userId,
    });
    return <p>Loading...</p>;
  }

  // Render the confirmation card
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="border-blue-500/30 bg-[#1a2b4b] max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white text-center">
            Sell Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white mb-4 text-center">
            Do you want to sell {name} for {parseFloat(price).toFixed(2)} ETH?
          </p>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <div className="flex justify-between">
            <Link href="/personal-assets">
              <Button variant="outline" className="text-white text-lg px-6 py-3">
                No
              </Button>
            </Link>
            <Button
              variant="outline"
              className="text-white text-lg px-6 py-3"
              onClick={handleSell}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Yes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}