"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { isAddress } from "ethers";
import { useSearchParams } from "next/navigation";

export default function SecureTradingInterface() {
    const searchParams = useSearchParams();
    const tradeid = searchParams?.get("tradeid") || "";
    const walletid = searchParams?.get("walletid") || ""; // Recipient address
    const price = searchParams?.get("price") || "0"; // Buy amount

    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [error, setError] = useState<string>("");
    const [ethBalance, setEthBalance] = useState<string>("0");
    const [recipient, setRecipient] = useState<string>(walletid); // Set from query param
    const [amount, setAmount] = useState<string>(price); // Set from query param
    const [loading, setLoading] = useState(false); // No need to fetch trade details

    // Remove the fetchTradeDetails useEffect since we're getting data from query params
    useEffect(() => {
        if (!walletid || !isAddress(walletid)) {
            setError("Invalid or missing recipient wallet address");
        }
        if (!price || isNaN(Number(price)) || Number(price) <= 0) {
            setError("Invalid or missing price amount");
        }
        setRecipient(walletid);
        setAmount(price);
    }, [walletid, price]);

    const getStoredAddress = () => {
        try {
            const stored = localStorage.getItem("walletid");
            if (!stored) throw new Error("No wallet stored");
            return stored.trim().toLowerCase();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Wallet error");
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
        if (!provider || !signer) return;

        try {
            if (!isAddress(recipient)) throw new Error("Invalid recipient address");
            if (isNaN(Number(amount)) || Number(amount) <= 0) throw new Error("Invalid amount");

            const tx = await signer.sendTransaction({
                to: recipient,
                value: ethers.parseEther(amount)
            });

            await tx.wait();
            updateBalances(provider, account!);
            setError("Payment successful! Transaction hash: " + tx.hash);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Transaction failed");
        }
    };

    return (
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
    );
}