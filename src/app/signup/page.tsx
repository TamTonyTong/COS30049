"use client"

import type React from "react"

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button"
import { Label } from "@/src/components/ui/label"
import Layout from "../../components/layout"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { ethers } from "ethers";

export default function SignUpForm() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [walletAddress, setWalletAddress] = useState("")
  const [walletError, setWalletError] = useState("")
  const router = useRouter()

  //useEffect checking Log in state
  useEffect(() => {
    // Check authentication status when component mounts
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
      setTimeout(() => router.push("/personal-assets"), 3000);
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  // Render Visual
  if (isCheckingAuth) {
    return (
      <Layout>
        <div className="mx-auto mt-8 max-w-md rounded-lg bg-[#1a2b4b] p-6 text-center text-white">
          Checking authentication status...
        </div>
      </Layout>
    );
  }

  const connectWallet = async () => {
    try {
      setWalletError("") // Clear previous errors
      if (!window.ethereum) throw new Error("Please install MetaMask to continue")

      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])

      if (accounts.length > 0) {
        setWalletAddress(accounts[0])
      }
    } catch (error: any) {
      setWalletError(error.message)
      console.error("Wallet connection error:", error)
    }
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    // New wallet validation
    if (!walletAddress) {
      newErrors.wallet = "Wallet connection is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Check if wallet already exists
      const { data: existingUser } = await supabase
        .from("User")
        .select("metawallet")
        .eq("metawallet", walletAddress)
        .single()

      if (existingUser) {
        throw new Error("Wallet already registered")
      }

      // Generate a UUID for the user
      const userId = uuidv4()

      // Insert new user into Supabase
      const { error } = await supabase.from("User").insert([
        {
          userid: userId,
          metawallet: walletAddress,
        },
      ])
      if (error) throw error

      // Save email and userid to localStorage
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userid", userId)
      localStorage.setItem("metawallet", walletAddress)

      // Redirect to personal-assets after successful signup
      router.push("/personal-assets")
    } catch (error: any) {
      console.error("Signup error:", error)
      setErrors({
        general: error.message || "An error occurred during sign up.",
        ...(error.message?.includes("Email") && { email: error.message }),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto mt-8 max-w-md rounded-lg bg-[#1a2b4b] p-6 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-center text-white">Sign Up with Wallet</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-white">
              Wallet Address *
              <span className="ml-1 text-red-500">(required)</span>
            </Label>
            <div className="mt-2">
              {walletAddress ? (
                <div className="flex items-center justify-between p-2 rounded-md bg-gray-800">
                  <span className="text-sm text-gray-200">
                    {truncateAddress(walletAddress)}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setWalletAddress("")}
                    className="text-xs"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={connectWallet}
                  variant="outline"
                  className="w-full text-white bg-purple-600 hover:bg-purple-700"
                >
                  Connect MetaMask Wallet
                </Button>
              )}
              {walletError && (
                <p className="mt-1 text-sm text-red-500">{walletError}</p>
              )}
              {errors.wallet && !walletError && (
                <p className="mt-1 text-sm text-red-500">{errors.wallet}</p>
              )}
            </div>
          </div>
          {errors.general && <p className="mt-2 text-center text-red-500">{errors.general}</p>}
          <Button type="submit" className="w-full text-white bg-blue-500 hover:bg-blue-600" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up with Wallet"}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-white">Already have an account?</p>
          <a href="/login" className="text-blue-300 hover:text-blue-200">
            Login here
          </a>
        </div>
      </div>
    </Layout>
  )
}

