"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { isAddress } from "ethers";
import TradingContractABI from "../../../../contracts/TradingContract.json";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Layout from "../../../components/layout";

//const TRADING_CONTRACT_ADDRESS = "0xF2f084A2f4fB8D836d47b176726e6aD01a2B7143";

export default function SecureTradingInterface() {
    const searchParams = useSearchParams();
    const tradeid = searchParams?.get("tradeid") || "";
    const metawallet = searchParams?.get("metawallet") || ""; // Recipient address (seller's wallet)
    const price = searchParams?.get("price") || "0"; // Buy amount
    const walletid = searchParams?.get("walletid") || "0";
    const router = useRouter();
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [tradingContract, setTradingContract] = useState<ethers.Contract | null>(null);
    const [error, setError] = useState<string>("");
    const [ethBalance, setEthBalance] = useState<string>("0");
    const [recipient, setRecipient] = useState<string>(metawallet); // Set from query param
    const [amount, setAmount] = useState<string>(price); // Set from query param
    const [isInvalid, setIsInvalid] = useState(false);

    useEffect(() => {
        // Validate all query parameters
        const validation =
            !tradeid ||
            !metawallet ||
            !walletid ||
            !isAddress(metawallet) ||
            tradeid.trim() === "" ||
            walletid.trim() === "";

        if (validation) {
            setIsInvalid(true);
            setTimeout(() => router.push("/markets"), 3000);
            return;
        }

        // Set data
        if (!metawallet || !isAddress(metawallet)) {
            setError("Invalid or missing recipient wallet address");
        }
        if (!price || isNaN(Number(price)) || Number(price) <= 0) {
            setError("Invalid or missing price amount");
        }
        setRecipient(metawallet);
        setAmount(price);
    }, [metawallet, price, router]);

    if (isInvalid) {
        return (
            <Layout>
                <div className="p-4 max-w-md mx-auto text-center">
                    <p className="text-red-500 font-medium">
                        Cannot resolve a direct connection to the page!
                    </p>
                    <p className="mt-2">Redirecting to Market...</p>
                </div>
            </Layout>
        );
    }

    const getStoredAddress = () => {
        try {
            const stored = localStorage.getItem("metawallet");
            if (!stored) throw new Error("No wallet stored");
            return stored.trim().toLowerCase();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Wallet error");
            throw err;
        }
    };

    const getUserID = () => {
        try {
            const stored = localStorage.getItem("userid");
            if (!stored) throw new Error("No UserID found");
            return stored.trim().toLowerCase();
        } catch (err) {
            setError(err instanceof Error ? err.message : "User error");
            throw err;
        }
    };

    const connectWallet = async () => {
        try {
            setError("");
            if (!window.ethereum) throw new Error("MetaMask required");

            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);

            if (accounts.length === 0) throw new Error("No accounts found");
            if (accounts[0].toLowerCase() !== getStoredAddress()) {
                throw new Error("Wallet mismatch with registered account");
            }

            const signer = await provider.getSigner();
            setProvider(provider);
            setSigner(signer);
            setAccount(accounts[0]);
            updateBalances(provider, accounts[0]);

            const contract = new ethers.Contract(
                //TRADING_CONTRACT_ADDRESS,
                recipient,
                TradingContractABI,
                signer
            );
            setTradingContract(contract);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Connection failed");
        }
    };

    const updateBalances = async (provider: ethers.BrowserProvider, address: string) => {
        try {
            const balance = await provider.getBalance(address);
            setEthBalance(ethers.formatEther(balance));
        } catch (err) {
            console.error("Balance update failed:", err);
        }
    };

    const executeTrade = async () => {
        if (!provider || !signer || !tradingContract) return;
    
        try {
            if (!isAddress(recipient)) throw new Error("Invalid recipient address");
            if (isNaN(Number(amount)) || Number(amount) <= 0) throw new Error("Invalid amount");
    
            // Convert amount to wei
            const weiAmount = ethers.parseEther(amount);
    
            const tx = await tradingContract.initiateTrade(recipient, weiAmount, { value: weiAmount });
    
            const receipt = await tx.wait();
            if (receipt.status === 0) {
                throw new Error("Transaction failed on the blockchain");
            }
    
            updateBalances(provider, account!);
    
            // Fetch trade details to get assetid and seller's userid
            const { data: tradeData, error: tradeFetchError } = await supabase
                .from("Trade")
                .select("assetid, userid")
                .eq("tradeid", tradeid)
                .single();
    
            if (tradeFetchError || !tradeData) {
                console.error("Failed to fetch trade details:", tradeFetchError?.message);
                setError("Failed to fetch trade details.");
                return;
            }
    
            const assetid = tradeData.assetid;
            const sellerUserId = tradeData.userid;
            const buyerUserId = getUserID();
    
            // Update the trade status to "Sold" and set txid
            const { data: buyerTransactionData, error: buyerTransactionError } = await supabase
                .from("Transaction")
                .insert({
                    userid: buyerUserId,
                    type: "Purchase",
                    amount: amount,
                    status: "Completed",
                    timestamp: new Date().toISOString(),
                    assetid: assetid,
                })
                .select("txid")
                .single();
    
            if (buyerTransactionError || !buyerTransactionData) {
                console.error("Failed to add buyer transaction:", buyerTransactionError?.message);
                setError("Failed to record buyer transaction.");
                return;
            }
    
            const txid = buyerTransactionData.txid;
    
            const { error: tradeError } = await supabase
                .from("Trade")
                .update({ status: "Sold", txid: txid })
                .eq("tradeid", tradeid);
    
            if (tradeError) {
                console.error("Failed to update trade status:", tradeError.message);
                setError("Failed to update trade status.");
                return;
            }
    
            // Change ownership in the Wallet table
            const { error: walletError } = await supabase
                .from("Wallet")
                .update({ userid: buyerUserId })
                .eq("walletid", walletid);
    
            if (walletError) {
                console.error("Failed to update wallet ownership:", walletError.message);
                setError("Failed to update wallet ownership.");
                return;
            }
    
            // Add transaction for the seller (Sale)
            const { error: sellerTransactionError } = await supabase
                .from("Transaction")
                .insert({
                    userid: sellerUserId,
                    type: "Sale",
                    amount: amount,
                    status: "Completed",
                    timestamp: new Date().toISOString(),
                    assetid: assetid,
                });
    
            if (sellerTransactionError) {
                console.error("Failed to add seller transaction:", sellerTransactionError.message);
                setError("Failed to record seller transaction.");
                return;
            }
    
            // Show success message and redirect
            setError("Purchase successful! Redirecting to markets...");
            setTimeout(() => router.push("/markets"), 2000);
    
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Transaction failed");
        }
    };
    return (
        <Layout>
            <div className="p-4 max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-4">Complete Your Purchase</h1>

                <div className="mb-4 space-y-2">
                    <p className="text-sm">
                        <span className="font-semibold">Recipient:</span>
                        <span className="ml-2 font-mono">{recipient || "Not provided"}</span>
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold">Amount:</span>
                        <span className="ml-2">{amount} ETH</span>
                    </p>
                    {tradeid && (
                        <p className="text-sm">
                            <span className="font-semibold">Trade ID:</span>
                            <span className="ml-2">{tradeid}</span>
                        </p>
                    )}
                </div>

                {!signer ? (
                    <button
                        onClick={connectWallet}
                        className="bg-blue-500 text-black p-3 rounded w-full hover:bg-blue-600"
                    >
                        Connect Wallet to Pay
                    </button>
                ) : (
                    <div className="mt-4 space-y-4">
                        <div className="p-4 text-black bg-gray-50 rounded">
                            <p className="text-sm">Connected Wallet: {account}</p>
                            <p className="text-sm mt-2">ETH Balance: {ethBalance}</p>
                        </div>

                        <button
                            onClick={executeTrade}
                            className="bg-green-500 text-black p-3 rounded w-full hover:bg-green-600"
                            disabled={!recipient || !amount || Number(amount) <= 0}
                        >
                            Confirm Payment
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}
            </div>
        </Layout>
    );
}