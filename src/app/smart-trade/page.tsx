"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { isAddress } from "ethers";
import TradingContractABI from "../../../contracts/TradingContract.json";

const TRADING_CONTRACT_ADDRESS = "0xa67e85D0dE9f30Da3C531Ce2aC16003711a5Fdac";

export default function SmartTrade() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [tradingContract, setTradingContract] = useState<ethers.Contract | null>(null);
  const [ethBalance, setEthBalance] = useState<string>("0");

  const [initiateRecipient, setInitiateRecipient] = useState<string>("");
  const [initiateAmount, setInitiateAmount] = useState<string>("");
  const [acceptSender, setAcceptSender] = useState<string>("");
  const [acceptAmount, setAcceptAmount] = useState<string>("");

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setProvider(provider);
        setSigner(signer);
        setAccount(accounts[0]);

        const contract = new ethers.Contract(
          TRADING_CONTRACT_ADDRESS,
          TradingContractABI,
          signer
        );
        setTradingContract(contract);

        await updateBalances(provider, accounts[0]);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        alert("Failed to connect wallet. Check console for details.");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const updateBalances = async (provider: ethers.BrowserProvider, account: string) => {
    try {
      const balance = await provider.getBalance(account);
      setEthBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error("Error updating balances:", error);
    }
  };

  const initiateTrade = async () => {
    if (!tradingContract || !initiateRecipient || !initiateAmount) {
      alert("Please fill in all fields.");
      return;
    }
    if (!isAddress(initiateRecipient)) {
      alert("Invalid recipient address. Please enter a valid 0x... address.");
      return;
    }
    try {
      const amountWei = ethers.parseEther(initiateAmount);
      const tx = await tradingContract.initiateTrade(initiateRecipient, amountWei, {
        value: amountWei,
      });
      await tx.wait();
      await updateBalances(provider!, account!);
      alert("Trade initiated successfully!");
    } catch (error) {
      console.error("Initiate trade failed:", error);
      alert("Failed to initiate trade. Check console for details.");
    }
  };


  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setAccount(accounts[0]);
        if (provider) updateBalances(provider, accounts[0]);
      });
    }
  }, [provider]);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Smart Trade with ETH</h1>
      <button
        onClick={connectWallet}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Connect Wallet
      </button>
      {account && (
        <div className="mt-4">
          <p className="text-sm">Account: {account}</p>
          <p className="text-sm">ETH Balance: {ethBalance} ETH</p>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">Initiate Trade</h2>
            <input
              type="text"
              placeholder="Recipient Address (0x...)"
              value={initiateRecipient}
              onChange={(e) => setInitiateRecipient(e.target.value)}
              className="border p-2 w-full mt-2 rounded"
            />
            <input
              type="text"
              placeholder="Amount (e.g., 1)"
              value={initiateAmount}
              onChange={(e) => setInitiateAmount(e.target.value)}
              className="border p-2 w-full mt-2 rounded"
            />
            <button
              onClick={initiateTrade}
              className="bg-green-500 text-white p-2 mt-2 rounded w-full hover:bg-green-600"
            >
              Initiate Trade
            </button>
          </div>

        </div>
      )}
    </div>
  );
}