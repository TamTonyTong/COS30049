"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import SimTokenABI from "../../../contracts/SimToken.json";
import TradingContractABI from "../../../contracts/TradingContract.json";

const SIMTOKEN_ADDRESS = "0x419FFc8a54A09F0a52E0972DA27f62dC3FA7afC4";
const TRADING_CONTRACT_ADDRESS = "0x2B3b831D4Eb1AdD0b6F5ddB8dbebc0F1E365C7Fe";

export default function SmartTrade() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [simToken, setSimToken] = useState<ethers.Contract | null>(null);
  const [tradingContract, setTradingContract] =
    useState<ethers.Contract | null>(null);
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [simBalance, setSimBalance] = useState<string>("0"); // Internal balance

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setProvider(provider);
        setSigner(signer);
        setAccount(accounts[0]);

        const simTokenContract = new ethers.Contract(
          SIMTOKEN_ADDRESS,
          SimTokenABI.abi,
          signer
        );
        const tradingContract = new ethers.Contract(
          TRADING_CONTRACT_ADDRESS,
          TradingContractABI.abi,
          signer
        );
        setSimToken(simTokenContract);
        setTradingContract(tradingContract);

        await updateBalances(provider, accounts[0], tradingContract);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const updateBalances = async (
    provider: ethers.BrowserProvider,
    account: string,
    tradingContract: ethers.Contract // Use tradingContract instead
  ) => {
    try {
      const ethBal = await provider.getBalance(account);
      const internalSimBal = await tradingContract.tokenBalances(account); // Internal balance
      setEthBalance(ethers.formatEther(ethBal));
      setSimBalance(ethers.formatEther(internalSimBal));
    } catch (error) {
      console.error("Error in updateBalances:", error);
    }
  };

  const buyTokens = async () => {
    if (!tradingContract) return;
    try {
      const amount = BigInt(1); // Hardcode 1 for testing
      const cost = amount * BigInt(1);
      const tx = await tradingContract.buyTokens(amount, {
        value: ethers.parseEther(cost.toString()),
      });
      await tx.wait();
      await updateBalances(provider!, account!, tradingContract!);
      alert("Buy successful!");
    } catch (error) {
      console.error("Buy failed:", error);
    }
  };

  const withdrawTokens = async () => {
    if (!tradingContract) return;
    try {
      const tx = await tradingContract.withdrawTokens(ethers.parseEther("1"));
      await tx.wait();
      await updateBalances(provider!, account!, tradingContract!);
      alert("Withdraw successful!");
    } catch (error) {
      console.error("Withdraw failed:", error);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setAccount(accounts[0]);
        if (provider && tradingContract)
          updateBalances(provider, accounts[0], tradingContract);
      });
    }
  }, [provider, tradingContract]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl text-blue-600 dark:text-sky-400 font-bold text-center mb-6">
          SimToken Trading
        </h1>
        {!account ? (
          <button
            onClick={connectWallet}
            className="w-full bg-teal-500 text-white py-2 px-4 rounded hover:bg-teal-600 transition"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="space-y-6">
            <div className="text-sm">
              <p className="truncate text-black">
                <strong>Account:</strong> {account}
              </p>
              <p className="text-black">
                <strong>ETH Balance:</strong> {ethBalance} ETH
              </p>
              <p className="text-black">
                <strong>Internal SIM Balance:</strong> {simBalance} SIM
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg text-black font-semibold">Buy SimToken</h2>
              <button
                onClick={buyTokens}
                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
              >
                Buy 1 SIM
              </button>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg text-black font-semibold">
                Withdraw SimToken
              </h2>
              <button
                onClick={withdrawTokens}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
              >
                Withdraw 1 SIM
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
