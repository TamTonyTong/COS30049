"use client";

import { useEffect } from "react";
import { ethers } from "ethers";
import platformNFTABI from "@/contracts/PlatformNFT.json";
import { supabase } from "@/lib/supabaseClient";

const ImportNFT = () => {
  const PLATFORM_NFT_ADDRESS = "0xDEF..."; // Replace with your deployed address

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

            // Fetch additional metadata (optional, if tokenURI points to a JSON file)
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
              full_name: metadata.name || `PlatformNFT #${tokenIdStr}`,
              abbreviated_name: (metadata.name || `PNFT${tokenIdStr}`).slice(0, 3).toUpperCase(),
              type: "NFT",
              eth_pricing: "1.0", // Default price, can be updated later
              owner: to,
              mint: "", // Transaction hash not available in event listener, can be added separately
              metadata: tokenURI,
              contract_address: PLATFORM_NFT_ADDRESS
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
      // Remove event listener (ethers.js handles this automatically in newer versions)
    };
  }, []);

  return <div>Listening for newly minted NFTs...</div>;
};

export default ImportNFT;