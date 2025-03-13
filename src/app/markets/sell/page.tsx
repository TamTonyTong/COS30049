'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { validate } from 'uuid';

// Utility function to fetch wallet data
const fetchWalletData = async (userId: string) => {
  const { data, error } = await supabase
    .from('Wallet')
    .select('walletid, assetid')
    .eq('userid', userId)
    .single();

  if (error || !data) {
    throw new Error('Wallet not found for user');
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
}) => {
  const { data, error } = await supabase
    .from('Trade')
    .insert([tradeData]);

  if (error) {
    throw new Error(`Failed to insert trade: ${error.message}`);
  }
  return data;
};

function SellConfirmPage() {
  const searchParams = useSearchParams();
  const name = searchParams?.get('name');
  const price = searchParams?.get('price');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch userId from localStorage (consistent with personal-assets/page.tsx)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userid");
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        // Optionally, check Supabase session as a fallback
        const fetchUser = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setUserId(session.user.id);
            localStorage.setItem("userid", session.user.id); // Store in localStorage for consistency
          } else {
            setError('Please log in to continue.');
          }
        };
        fetchUser();
      }
    }
  }, []);

  // Debug initial values
  useEffect(() => {
    console.log('Initial values:', { name, price, userId });
  }, [name, price, userId]);

  // Handle the sell action
  const handleSell = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate userId
      if (!userId || !validate(userId)) {
        throw new Error('Invalid user ID. Please log in again.');
      }

      if (!name || !price) {
        throw new Error('Missing asset name or price.');
      }

      // Fetch wallet data
      const walletData = await fetchWalletData(userId);
      console.log('Fetched wallet data:', walletData);
      const { assetid, walletid } = walletData;

      // Verify the asset
      const assetData = await verifyAsset(assetid, name);
      console.log('Verified asset:', assetData);

      // Fetch the latest price history
      const priceHistoryData = await fetchPriceHistory(assetid);
      console.log('Fetched price history:', priceHistoryData);
      const { pricehistoryid } = priceHistoryData;

      // Validate all UUIDs
      validateUUIDs({ assetid, userId, pricehistoryid, walletid });

      // Prepare trade data
      const tradeData = {
        assetid,
        userid: userId,
        status: 'Buy', // Initial status for listing
        pricehistoryid,
        walletid,
      };

      // Insert trade
      const tradeResult = await insertTrade(tradeData);
      console.log('Trade inserted successfully:', tradeResult);

      // Redirect to personal-assets page
      window.location.href = '/personal-assets';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to list trade for sale:', errorMessage, error);
      setError(`Failed to list trade for sale: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Redirect to login if userId is not found
  if (!userId && error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50">
        <Card className="border-blue-500/30 bg-[#1a2b4b] max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white text-center">
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 text-center mb-4">{error}</p>
            <div className="flex justify-center">
              <Link href="/login">
                <Button variant="outline" className="text-white text-lg px-6 py-3">
                  Log In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (!searchParams || !name || !price || !userId) {
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
          <CardTitle className="text-2xl font-bold text-white text-center">
            Sell Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white mb-4 text-center">
            Do you want to list {name} for sale at {parseFloat(price).toFixed(2)} ETH?
          </p>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <div className="flex justify-between">
            <Link href="/personal-assets">
              <Button variant="outline" className="text-white text-lg px-6 py-3">
                Cancel
              </Button>
            </Link>
            <Button
              variant="outline"
              className="text-white text-lg px-6 py-3"
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