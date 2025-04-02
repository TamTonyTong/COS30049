"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { isAddress } from "ethers";
import TradingContractABI from "@/contracts/TradingContract.json";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Layout from "../../../components/layout";

const TRADING_CONTRACT_ADDRESS = "0x285b7Eea1D448E9AD2B0B819B864f3287c078a9D";

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
                <div className="max-w-md p-4 mx-auto text-center">
                    <p className="font-medium text-red-500">
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
                TRADING_CONTRACT_ADDRESS,
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

            const weiAmount = ethers.parseEther(amount);

            const tx = await tradingContract.initiateTrade(recipient, weiAmount, { value: weiAmount });

            const receipt = await tx.wait();
            if (receipt.status === 0) {
                throw new Error("Transaction failed on the blockchain");
            }

            updateBalances(provider, account!);

            // Fetch trade details to get assetid, seller's userid, and collection_id
            const { data: tradeData, error: tradeFetchError } = await supabase
                .from("Trade")
                .select("assetid, userid, collection_id")
                .eq("tradeid", tradeid)
                .single();

            if (tradeFetchError || !tradeData) {
                console.error("Failed to fetch trade details:", tradeFetchError?.message);
                setError("Failed to fetch trade details.");
                return;
            }

            const assetid = tradeData.assetid;
            const sellerUserId = tradeData.userid;
            const collectionId = tradeData.collection_id;
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

            // Decrement nftsforsale in the Collection table
            const { data: collectionData, error: fetchCollectionError } = await supabase
                .from("Collection")
                .select("nftsforsale")
                .eq("collection_id", collectionId)
                .single();

            if (fetchCollectionError || !collectionData) {
                console.error("Failed to fetch collection:", fetchCollectionError?.message);
                setError("Failed to fetch collection data.");
                return;
            }

            const newNftsforsale = Math.max((collectionData.nftsforsale || 0) - 1, 0);

            const { error: updateCollectionError } = await supabase
                .from("Collection")
                .update({ nftsforsale: newNftsforsale })
                .eq("collection_id", collectionId);

            if (updateCollectionError) {
                console.error("Failed to update nftsforsale:", updateCollectionError.message);
                setError("Failed to update collection data.");
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
                    type: "Sell",
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

            // Set Current Balance
            const balanceWei = await provider.getBalance(getStoredAddress());
            const balanceEth = parseFloat(ethers.formatEther(balanceWei)).toFixed(18);

            const { error: updateError } = await supabase
                .from("User")
                .update({ balance: balanceEth })
                .ilike("metawallet", getStoredAddress());

            if (updateError) throw new Error("Failed to update balance");

            // Show success message and redirect
            setError("Purchase successful! Redirecting to markets...");
            setTimeout(() => router.push("/markets"), 2000);
        } catch (err) {
            console.error("Transaction Error:", err);

            const errorMessage = (err instanceof Error) ? err.message : JSON.stringify(err);

            if (errorMessage.includes("user denied") || errorMessage.includes("ACTION_REJECTED")) {
                setError("Transaction cancelled - no funds were transferred");
            } else {
                setError("Transaction failed. Please try again.");
            }
        }
    };

    return (
        <Layout>
            <div className="max-w-md p-4 mx-auto">
                <h1 className="mb-4 text-2xl font-bold">Complete Your Purchase</h1>

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
                        className="w-full p-3 text-black bg-blue-500 rounded hover:bg-blue-600"
                    >
                        Connect Wallet to Pay
                    </button>
                ) : (
                    <div className="mt-4 space-y-4">
                        <div className="p-4 text-black rounded bg-gray-50">
                            <p className="text-sm">Connected Wallet: {account}</p>
                            <p className="mt-2 text-sm">ETH Balance: {ethBalance}</p>
                        </div>

                        <button
                            onClick={executeTrade}
                            className="w-full p-3 text-black bg-green-500 rounded hover:bg-green-600"
                            disabled={!recipient || !amount || Number(amount) <= 0}
                        >
                            Confirm Payment
                        </button>
                    </div>
                )}
                {error && (
                    <div className={`mt-4 p-3 rounded-lg border ${error.includes("cancelled") ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                        {error}
                    </div>
                )}
            </div>
        </Layout>
    );
}