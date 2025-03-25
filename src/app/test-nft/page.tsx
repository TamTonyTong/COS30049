"use client";

import { useEffect } from "react";
import { ethers } from "ethers";
import platformNFTABI from "@/contracts/PlatformNFT.json";
import { supabase } from "@/lib/supabaseClient";

const ImportNFT = () => {
  const PLATFORM_NFT_ADDRESS = "0xe4d6664D5b191960273E9aE2eA698DA30FDF519f"; 

  useEffect(() => {
    const setupEventListener = async () => {
      try {
        if (!window.ethereum) {
          throw new Error("Ethereum provider not found. Please install MetaMask.");
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const platformNFT = new ethers.Contract(PLATFORM_NFT_ADDRESS, platformNFTABI, provider);

        // Listen for Transfer events (emitted during minting)
        platformNFT.on("Transfer", async (from, to, tokenId) => {
          if (from === ethers.ZeroAddress) {
            // This is a minting event (from address(0))
            const tokenIdStr = tokenId.toString();
            const tokenURI = await platformNFT.tokenURI(tokenId);

            // Fetch additional metadata
            let metadata: { name?: string } = {};
            try {
              const response = await fetch(tokenURI);
              metadata = await response.json();
            } catch (error) {
              console.error("Error fetching metadata:", error);
            }

            // Import into Supabase
            const { data, error } = await supabase.from("Asset").insert({
              assetid: tokenIdStr,
              symbol: (metadata.name || `PNFT${tokenIdStr}`).slice(0, 3).toUpperCase(),
              assettype: "NFT",
              createdat: new Date().toISOString(),
              isactive: true,
              name: metadata.name || `PlatformNFT #${tokenIdStr}`,
              creatorid: "0x6ED13c14F988C123b35fF37f260334CBA1e2C553", 
              img: "https://xsowlfczzjfhklzphkbl.supabase.co/storage/v1/object/public/nft-img/07352823-cea3-464a-a951-b6dc3f37dce9.png"
            });

            if (error) {
              console.error("Error importing NFT to Supabase:", error);
            } else {
              console.log("NFT imported to Supabase:", data);
            }
          }
        });
      } catch (error) {
        console.error("Error setting up event listener:", error);
      }
    };

    setupEventListener();

    // Cleanup listener on component unmount
    return () => {
    };
  }, []);

  return <div>Listening for newly minted NFTs...</div>;
};

export default ImportNFT;