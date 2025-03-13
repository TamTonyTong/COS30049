"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { isAddress } from "ethers";

export default function SecureTradingInterface() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [error, setError] = useState<string>("");
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [contractAddress, setContractAddress] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  // Enhanced storage handling
  const getStoredAddress = () => {
    try {
      const stored = localStorage.getItem("walletid");
      if (!stored) throw new Error("No wallet stored");

      // Normalize address format
      const normalized = stored.trim().toLowerCase();
      if (!isAddress(normalized)) {
        // Auto-clear invalid storage
        localStorage.removeItem("walletid");
        throw new Error("Invalid address format in storage");
      }

      return normalized;
    } catch (err) {
      if (err instanceof Error) {
        console.error("Connection failed:", err.message);
        setError(err.message);
      } else {
        console.error("Unknown error:", err);
        setError("An unexpected error occurred.");
      }
      throw err;
    }
  };

  const connectWallet = async () => {
    try {
      setError("");

      // Always get fresh stored address
      const storedAddress = getStoredAddress();

      if (!window.ethereum) throw new Error("MetaMask extension required");

      const provider = new ethers.BrowserProvider(window.ethereum);

      // Get current accounts without cache
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length === 0) throw new Error("No accounts available");

      // Get current active account
      const currentAddress = accounts[0].toLowerCase();

      // Validate match with storage
      if (currentAddress !== storedAddress) {
        throw new Error(`
          Account mismatch! 
          Connected: ${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}
          Expected: ${storedAddress.slice(0, 6)}...${storedAddress.slice(-4)}
        `);
      }

      const signer = await provider.getSigner();
      setProvider(provider);
      setSigner(signer);
      await updateBalances(provider, currentAddress);

    } catch (err) {
      if (err instanceof Error) {
        console.error("Connection failed:", err.message);
        setError(err.message);
      } else {
        console.error("Unknown error:", err);
        setError("An unexpected error occurred.");
      }
      setProvider(null);
      setSigner(null);
    }
  };

  // Add account change listener
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setError("Wallet disconnected");
        setProvider(null);
        setSigner(null);
      }
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const updateBalances = async (provider: ethers.BrowserProvider, address: string) => {
    try {
      const balance = await provider.getBalance(address);
      setEthBalance(ethers.formatEther(balance));
    } catch (err) {
      if (err instanceof Error) {
        console.error("Balance update failed:", err.message);
      } else {
        console.error("Unknown error:", err);
      }
    }
  };

  const executeTrade = async () => {
    if (!provider || !signer) return;

    try {
      // Validate all parameters
      if (!isAddress(contractAddress)) throw new Error("Invalid contract address");
      if (!isAddress(recipient)) throw new Error("Invalid recipient address");
      if (isNaN(Number(amount)) || Number(amount) <= 0) throw new Error("Invalid amount");

      const amountWei = ethers.parseEther(amount);
      const tx = await signer.sendTransaction({
        to: recipient,
        value: amountWei
      });

      await tx.wait();
      await updateBalances(provider, account!);
      setError("Transaction successful!");
    } catch (err) {
      if (err instanceof Error) {
        console.error("Trade failed:", err.message);
        setError(err.message);
      } else {
        console.error("Unknown error:", err);
        setError("An unexpected error occurred during the trade.");
      }
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Secure Trading Interface</h1>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Registered address: {account || "None"}
        </p>
      </div>

      <button
        onClick={connectWallet}
        className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600"
      >
        Verify Wallet
      </button>

      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {signer && (
        <div className="mt-4">
          <div className="mb-4">
            <p className="text-sm">ETH Balance: {ethBalance}</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Contract Address (0x...)"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              className="border p-2 w-full rounded"
            />

            <input
              type="text"
              placeholder="Recipient Address (0x...)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="border p-2 w-full rounded"
            />

            <input
              type="number"
              placeholder="ETH Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border p-2 w-full rounded"
              step="0.001"
            />

            <button
              onClick={executeTrade}
              className="bg-green-500 text-white p-2 rounded w-full hover:bg-green-600"
            >
              Execute Secure Transfer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
