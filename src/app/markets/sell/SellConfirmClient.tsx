'use client';

import { useSearchParams } from 'next/navigation';
export const dynamic = 'force-dynamic';
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { validate } from 'uuid';

// Utility function to fetch or create wallet data
const fetchOrCreateWalletData = async (userId: string, assetid: string) => {
  const { data, error } = await supabase
    .from('Wallet')
    .select('walletid, assetid, quantity')
    .eq('userid', userId)
    .eq('assetid', assetid)
    .single();

  if (error && error.code === 'PGRST116') { // No rows returned
    console.log(`No wallet found for user ${userId} and asset ${assetid}. Creating new wallet entry...`);
    const { data: newWalletData, error: newWalletError } = await supabase
      .from('Wallet')
      .insert({
        userid: userId,
        assetid: assetid,
        address: `addr_${userId}_${assetid}`,
        nonce: 0,
        quantity: 1,
        lockedbalance: 0,
        lastupdated: new Date().toISOString(),
      })
      .select('walletid, assetid, quantity')
      .single();

    if (newWalletError) {
      throw new Error(`Failed to create wallet: ${newWalletError.message}`);
    }
    return newWalletData;
  } else if (error) {
    throw new Error(`Wallet fetch error: ${error.message}`);
  }
  return data;
};

// Utility function to verify asset
const verifyAsset = async (assetid: string, symbol: string) => {
  const { data, error } = await supabase
    .from('Asset')
    .select('assetid, symbol')
    .eq('assetid', assetid)
    .eq('symbol', symbol)
    .single();

  if (error || !data) {
    throw new Error('Asset not found or does not match the provided symbol');
  }
  return data;
};

// Utility function to fetch the latest price history
const fetchPriceHistory = async (assetid: string) => {
  const { data, error } = await supabase
    .from('PriceHistory')
    .select('pricehistoryid')
    .eq('assetid', assetid)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error('No price history found for the asset');
  }
  return data;
};

// Utility function to validate UUIDs
const validateUUIDs = (ids: { [key: string]: string }) => {
  const invalidUUIDs = Object.entries(ids)
    .filter(([key, value]) => !validate(value))
    .map(([key]) => key);

  if (invalidUUIDs.length > 0) {
    throw new Error(`Invalid UUIDs: ${invalidUUIDs.join(', ')}`);
  }
};

// Utility function to insert trade into Trade table
const insertTrade = async (tradeData: {
  assetid: string;
  userid: string;
  status: string;
  pricehistoryid: string;
  walletid: string;
  collection_id?: string | null;
}) => {
  const { data, error } = await supabase
    .from('Trade')
    .insert([tradeData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert trade: ${error.message}`);
  }
  return data;
};

function SellConfirmPage() {
  const searchParams = useSearchParams();
  const name = searchParams?.get('name');
  const price = searchParams?.get('price');
  const assetid = searchParams?.get('assetid');
  const collection_id = searchParams?.get('collection_id');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userid");
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        const fetchUser = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setUserId(session.user.id);
            localStorage.setItem("userid", session.user.id);
          } else {
            setError('Please log in to continue.');
          }
        };
        fetchUser();
      }
    }
  }, []);

  useEffect(() => {
    console.log('Initial values:', { name, price, assetid, collection_id, userId });
  }, [name, price, assetid, collection_id, userId]);

  const handleSell = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!userId || !validate(userId)) {
        throw new Error('Invalid user ID. Please log in again.');
      }

      if (!name || !price || !assetid) {
        throw new Error('Missing asset name, price, or asset ID.');
      }

      if (!collection_id) {
        throw new Error('Missing collection ID.');
      }

      const { data: assetData, error: assetError } = await supabase
        .from('Asset')
        .select('assetid, symbol')
        .eq('assetid', assetid)
        .eq('name', name)
        .eq('isactive', true)
        .single();

      if (assetError || !assetData) {
        throw new Error('Asset not found for the given name and asset ID');
      }
      const { symbol } = assetData;

      const walletData = await fetchOrCreateWalletData(userId, assetid);
      console.log('Fetched or created wallet data:', walletData);
      const { walletid } = walletData;

      await verifyAsset(assetid, symbol);
      console.log('Verified asset with assetid:', assetid);

      const priceHistoryData = await fetchPriceHistory(assetid);
      console.log('Fetched price history:', priceHistoryData);
      const { pricehistoryid } = priceHistoryData;

      validateUUIDs({ assetid, userId, pricehistoryid, walletid });

      const tradeData = {
        assetid,
        userid: userId,
        status: 'Buy',
        pricehistoryid,
        walletid,
        collection_id: collection_id || null,
      };

      const tradeResult = await insertTrade(tradeData);
      console.log('Trade inserted successfully:', tradeResult);

      // Increment nftsforsale in the Collection table
      const { data: collectionData, error: fetchCollectionError } = await supabase
        .from('Collection')
        .select('nftsforsale')
        .eq('collection_id', collection_id)
        .single();

      if (fetchCollectionError || !collectionData) {
        console.error('Error fetching collection:', fetchCollectionError?.message);
        throw new Error('Failed to fetch collection data.');
      }

      const newNftsforsale = (collectionData.nftsforsale || 0) + 1;

      const { error: updateCollectionError } = await supabase
        .from('Collection')
        .update({ nftsforsale: newNftsforsale })
        .eq('collection_id', collection_id);

      if (updateCollectionError) {
        console.error('Error incrementing nftsforsale:', updateCollectionError.message);
        throw new Error('Failed to update collection data.');
      }

      window.location.href = '/markets';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to list trade for sale:', errorMessage, error);
      setError(`Failed to list trade for sale: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!userId && error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50">
        <Card className="border-blue-500/30 bg-[#1a2b4b] max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-white">
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-center text-red-500">{error}</p>
            <div className="flex justify-center">
              <Link href="/login">
                <Button variant="outline" className="px-6 py-3 text-lg text-white">
                  Log In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!searchParams || !name || !price || !assetid || !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="border-blue-500/30 bg-[#1a2b4b] max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">
            Sell Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-center text-white">
            Do you want to sell {name} for {parseFloat(price).toFixed(2)} ETH?
          </p>
          {error && <p className="mb-4 text-center text-red-500">{error}</p>}
          <div className="flex justify-between">
            <Link href="/personal">
              <Button variant="outline" className="px-6 py-3 text-lg text-white">
                Cancel
              </Button>
            </Link>
            <Button
              variant="outline"
              className="px-6 py-3 text-lg text-white"
              onClick={handleSell}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SellConfirmPage;