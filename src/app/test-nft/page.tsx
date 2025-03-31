"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import platformNFTABI from "@/contracts/PlatformNFT.json";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

const ImportNFT = () => {
  const PLATFORM_NFT_ADDRESS = "0xe4d6664D5b191960273E9aE2eA698DA30FDF519f";
  const [status, setStatus] = useState("Initializing...");

  const fetchWithTimeout = async (url: string, timeout = 3000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  useEffect(() => {
    const executeMintProcess = async () => {
      try {
        if (!window.ethereum) throw new Error("MetaMask required");

        setStatus("Connecting wallet...");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const currentAddress = await signer.getAddress();

        setStatus("Minting NFT...");
        const contract = new ethers.Contract(
          PLATFORM_NFT_ADDRESS,
          platformNFTABI,
          signer
        );

        const tx = await contract.mint(currentAddress);
        const receipt = await tx.wait();

        setStatus("Processing transaction...");
        const iface = new ethers.Interface(platformNFTABI);
        const log = receipt.logs[0] ? iface.parseLog(receipt.logs[0]) : null;
        if (!log) throw new Error("No valid event log found");

        const tokenId = log.args.tokenId.toString();

        setStatus("Fetching metadata...");
        const tokenURI = await contract.tokenURI(tokenId);
        const metadata = await fetchWithTimeout(tokenURI)
          .then(r => r.json())
          .catch(() => ({
            name: `PlatformNFT #${tokenId}`,
            image: 'https://xsowlfczzjfhklzphkbl.supabase.co/storage/v1/object/public/nft-img/509120be-33e0-41bc-8d42-d27c518506b4.jpg'
          }));

        setStatus("Updating database...");
        const { error } = await supabase.from("Asset").insert({
          assetid: uuidv4(),
          mint: tokenId,
          symbol: metadata.name.slice(0, 3).toUpperCase(),
          assettype: "NFT",
          createdat: new Date().toISOString(),
          isactive: true,
          name: metadata.name,
          creatorid: "01416ac6-ff76-4f9d-84c1-4de4f90b0cb6",
          img: metadata.image
        });

        if (error) throw new Error(`Database error: ${error.message}`);

        setStatus("Finalizing...");
        await window.ethereum?.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC721",
            options: {
              address: PLATFORM_NFT_ADDRESS,
              tokenId: tokenId,
              name: `PlatformNFT #${tokenId}`,
              symbol: 'PNFT',
              image: metadata.image,
              decimals: 0
            }
          }
        });

        setStatus("NFT successfully created!");

      } catch (error) {
        console.error("Process failed:", error);
        setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    };

    executeMintProcess();
  }, []);

  return <div className="status-container">{status}</div>;
};

export default ImportNFT;