import { supabase } from '../../../lib/supabaseClient';
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // Import UUID library

// Function to fetch data from CoinGecko API
async function fetchCoinGeckoData() {
  const url = 'https://api.coingecko.com/api/v3/coins/markets';
  const params = {
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: 20, // Fetch top 100 coins
    page: 1,
    sparkline: false,
  };

  try {
    const response = await axios.get(url, { params });
    return response.data.map((asset: any) => ({
      symbol: asset.symbol || 'N/A', // Default value if missing
      name: asset.name || 'N/A', // Default value if missing
      current_price: asset.current_price || 0, // Default value if missing
      price_change_percentage_24h: asset.price_change_percentage_24h || 0, // Default value if missing
      total_volume: asset.total_volume || 0, // Default value if missing
      market_cap: asset.market_cap || 0, // Default value if missing
      last_updated: asset.last_updated || new Date().toISOString(), // Default value if missing
      assettype: 'cryptocurrency', // Default asset type
      decimals: 8, // Default decimals
    }));
  } catch (error) {
    console.error('Error fetching data from CoinGecko:', error);
    return [];
  }
}

// Function to insert data into Supabase
async function insertAssetsIntoSupabase(assets: any[]) {
  for (const asset of assets) {
    const { symbol, name, current_price, price_change_percentage_24h, total_volume, market_cap, last_updated, assettype, decimals } = asset;

    // Generate a UUID for the asset
    const assetid = uuidv4();

    // Map CoinGecko data to your Price table structure
    const assetData = {
      assetid: assetid, // Use the generated UUID
      symbol: symbol.toUpperCase(), // Asset symbol
      name: name, // Asset name
      current_price: current_price, // Current price
      price_change_percentage_24h: price_change_percentage_24h, // 24h change percentage
      total_volume: total_volume, // 24h volume
      market_cap: market_cap, // Market cap
      createdat: new Date(last_updated).toISOString(), // Created at
      isactive: true, // Is active
      assettype: assettype, // Asset type
      decimals: decimals, // Decimals
    };

    // Insert into Supabase
    const { data, error } = await supabase
    .from('Price')
    .upsert([assetData], { onConflict: 'symbol' }); // Use 'symbol' as the conflict key

    if (error) {
      console.error('Error inserting asset:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    } else {
      console.log('Inserted/Updated asset:', assetData.symbol);
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Fetch data from CoinGecko
      const coinGeckoData = await fetchCoinGeckoData();

      if (coinGeckoData.length > 0) {
        // Insert data into Supabase
        await insertAssetsIntoSupabase(coinGeckoData);

        // Fetch the updated data from Supabase
        const { data: supabaseData, error } = await supabase
          .from('Price') // Use the Price table name
          .select('symbol, name, current_price, price_change_percentage_24h, total_volume, market_cap, assettype, decimals');

        if (error) {
          throw error;
        }

        // Return the updated data
        res.status(200).json({ assets: supabaseData });
      } else {
        res.status(200).json({ assets: [] });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}