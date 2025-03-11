"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import SimTokenABI from "../../../contracts/SimToken.json"
import TradingContractABI from "../../../contracts/TradingContract.json"
import Layout from "@/src/components/layout"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
} from "lucide-react"

const SIMTOKEN_ADDRESS = "0x8269C4DFcdB6066Ed468ed5D4EC4e8198870a284"
const TRADING_CONTRACT_ADDRESS = "0xbE94D1295C7A4e413175F84a2E4120Fe3ba918E7"

type Transaction = {
  id: string
  type: "buy" | "withdraw"
  amount: string
  status: "pending" | "success" | "failed"
  timestamp: number
}

export default function SmartTrade() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [simToken, setSimToken] = useState<ethers.Contract | null>(null)
  const [tradingContract, setTradingContract] = useState<ethers.Contract | null>(null)
  const [ethBalance, setEthBalance] = useState<string>("0")
  const [simBalance, setSimBalance] = useState<string>("0") // Internal balance
  const [externalSimBalance, setExternalSimBalance] = useState<string>("0") // External balance
  const [buyAmount, setBuyAmount] = useState<string>("1")
  const [withdrawAmount, setWithdrawAmount] = useState<string>("1")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [networkName, setNetworkName] = useState<string>("")

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        setIsConnecting(true)
        setError(null)

        const provider = new ethers.BrowserProvider(window.ethereum)
        const network = await provider.getNetwork()
        setNetworkName(network.name === "homestead" ? "Ethereum Mainnet" : network.name)

        const signer = await provider.getSigner()
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })

        setProvider(provider)
        setSigner(signer)
        setAccount(accounts[0])

        const simTokenContract = new ethers.Contract(SIMTOKEN_ADDRESS, SimTokenABI.abi, signer)
        const tradingContract = new ethers.Contract(TRADING_CONTRACT_ADDRESS, TradingContractABI.abi, signer)

        setSimToken(simTokenContract)
        setTradingContract(tradingContract)

        await updateBalances(provider, accounts[0], simTokenContract, tradingContract)
        setSuccess("Wallet connected successfully!")
      } catch (error) {
        console.error("Failed to connect wallet:", error)
        setError("Failed to connect wallet. Please make sure MetaMask is installed and unlocked.")
      } finally {
        setIsConnecting(false)
      }
    } else {
      setError("Please install MetaMask to use this feature!")
    }
  }

  const updateBalances = async (
    provider: ethers.BrowserProvider,
    account: string,
    simTokenContract: ethers.Contract,
    tradingContract: ethers.Contract,
  ) => {
    try {
      setIsRefreshing(true)

      const ethBal = await provider.getBalance(account)
      const internalSimBal = await tradingContract.tokenBalances(account) // Internal balance
      const externalSimBal = await simTokenContract.balanceOf(account) // External balance

      setEthBalance(ethers.formatEther(ethBal))
      setSimBalance(ethers.formatEther(internalSimBal))
      setExternalSimBalance(ethers.formatEther(externalSimBal))
    } catch (error) {
      console.error("Error in updateBalances:", error)
      setError("Failed to update balances. Please try again.")
    } finally {
      setIsRefreshing(false)
    }
  }

  const buyTokens = async () => {
    if (!tradingContract || !provider || !account || !simToken) return

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      const amount = ethers.parseEther(buyAmount)
      const txId = `buy-${Date.now()}`

      // Add pending transaction
      setTransactions((prev) => [
        {
          id: txId,
          type: "buy",
          amount: buyAmount,
          status: "pending",
          timestamp: Date.now(),
        },
        ...prev,
      ])

      const tx = await tradingContract.buyTokens(amount, {
        value: amount,
      })

      await tx.wait()

      // Update transaction status
      setTransactions((prev) => prev.map((t) => (t.id === txId ? { ...t, status: "success" } : t)))

      await updateBalances(provider, account, simToken, tradingContract)
      setSuccess(`Successfully purchased ${buyAmount} SIM tokens!`)
    } catch (error) {
      console.error("Buy failed:", error)

      // Update transaction status to failed
      setTransactions((prev) => prev.map((t) => (t.id === `buy-${Date.now()}` ? { ...t, status: "failed" } : t)))

      setError("Transaction failed. Please check your balance and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const withdrawTokens = async () => {
    if (!tradingContract || !provider || !account || !simToken) return

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      const amount = ethers.parseEther(withdrawAmount)
      const txId = `withdraw-${Date.now()}`

      // Add pending transaction
      setTransactions((prev) => [
        {
          id: txId,
          type: "withdraw",
          amount: withdrawAmount,
          status: "pending",
          timestamp: Date.now(),
        },
        ...prev,
      ])

      const tx = await tradingContract.withdrawTokens(amount)

      await tx.wait()

      // Update transaction status
      setTransactions((prev) => prev.map((t) => (t.id === txId ? { ...t, status: "success" } : t)))

      await updateBalances(provider, account, simToken, tradingContract)
      setSuccess(`Successfully withdrawn ${withdrawAmount} SIM tokens to your wallet!`)
    } catch (error) {
      console.error("Withdraw failed:", error)

      // Update transaction status to failed
      setTransactions((prev) => prev.map((t) => (t.id === `withdraw-${Date.now()}` ? { ...t, status: "failed" } : t)))

      setError("Withdrawal failed. Please check your balance and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshBalances = async () => {
    if (!provider || !account || !simToken || !tradingContract) return
    await updateBalances(provider, account, simToken, tradingContract)
  }

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        setAccount(accounts[0])
        if (provider && simToken && tradingContract) {
          updateBalances(provider, accounts[0], simToken, tradingContract)
        }
      }

      const handleChainChanged = () => {
        window.location.reload()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      // Return cleanup function that removes specific event listeners
      return () => {
        if (typeof window !== "undefined" && window.ethereum) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [provider, simToken, tradingContract])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [error, success])

  // Format time for transaction history
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          className="text-3xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Smart Contract Trading
        </motion.h1>

        <motion.p
          className="text-gray-400 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Trade SimTokens directly using smart contracts on the blockchain. Connect your wallet to get started.
        </motion.p>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-500/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert className="mb-4 bg-green-900/20 border-green-500/50 text-green-400">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="border-blue-500/30 bg-[#1a2b4b]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">SimToken Trading</CardTitle>
            <CardDescription className="text-gray-300">
              Trade SimTokens directly using smart contracts on the Ethereum blockchain
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!account ? (
              <motion.div
                className="flex flex-col items-center justify-center py-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  <Wallet className="h-16 w-16 text-blue-400 mb-4" />
                </motion.div>
                <h2 className="text-xl font-semibold text-white mb-4">Connect Your Wallet</h2>
                <p className="text-gray-300 text-center mb-6">
                  Connect your Ethereum wallet to start trading SimTokens on the blockchain
                </p>
                <Button
                  onClick={connectWallet}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Wallet"
                  )}
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div
                    className="bg-[#0d1829] p-4 rounded-lg border border-blue-500/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-gray-400 text-sm mb-1">ETH Balance</div>
                    <div className="text-white text-xl font-bold flex items-center">
                      {ethBalance} ETH
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-2 text-blue-400 hover:text-blue-300 hover:bg-[#243860]"
                              onClick={refreshBalances}
                              disabled={isRefreshing}
                            >
                              <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Refresh balances</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-[#0d1829] p-4 rounded-lg border border-blue-500/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="text-gray-400 text-sm mb-1">Trading Contract Balance</div>
                    <div className="text-white text-xl font-bold">{simBalance} SIM</div>
                  </motion.div>

                  <motion.div
                    className="bg-[#0d1829] p-4 rounded-lg border border-blue-500/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <div className="text-gray-400 text-sm mb-1">Wallet SIM Balance</div>
                    <div className="text-white text-xl font-bold">{externalSimBalance} SIM</div>
                  </motion.div>
                </div>

                <motion.div
                  className="bg-[#0d1829]/50 rounded-lg border border-blue-500/20 p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <div className="text-sm text-gray-300 mb-2">Connected Account</div>
                  <div className="flex items-center">
                    <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                      <Wallet className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="truncate text-white">{account}</div>
                      <div className="text-xs text-blue-400">{networkName}</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <Tabs defaultValue="buy" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-[#0d1829]">
                      <TabsTrigger value="buy">Buy Tokens</TabsTrigger>
                      <TabsTrigger value="withdraw">Withdraw Tokens</TabsTrigger>
                    </TabsList>

                    <TabsContent value="buy" className="mt-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label htmlFor="buy-amount" className="text-white">
                              Amount to Buy
                            </label>
                            <span className="text-sm text-gray-400">Available: {ethBalance} ETH</span>
                          </div>
                          <div className="flex space-x-2">
                            <Input
                              id="buy-amount"
                              type="number"
                              value={buyAmount}
                              onChange={(e) => setBuyAmount(e.target.value)}
                              min="0.000001"
                              step="0.000001"
                              className="bg-[#243860] text-white border-gray-700"
                            />
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="border-gray-700 text-white hover:bg-[#243860]"
                                    onClick={() => setBuyAmount(ethBalance)}
                                  >
                                    Max
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Use maximum available ETH</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Cost: {buyAmount} ETH</span>
                            <span className="text-gray-400">You'll receive: {buyAmount} SIM</span>
                          </div>
                        </div>

                        <Button
                          onClick={buyTokens}
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                          disabled={isLoading || !buyAmount || Number.parseFloat(buyAmount) <= 0}
                        >
                          {isLoading ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <ArrowDownToLine className="mr-2 h-4 w-4" />
                              Buy SimTokens
                            </>
                          )}
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="withdraw" className="mt-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label htmlFor="withdraw-amount" className="text-white">
                              Amount to Withdraw
                            </label>
                            <span className="text-sm text-gray-400">Available: {simBalance} SIM</span>
                          </div>
                          <div className="flex space-x-2">
                            <Input
                              id="withdraw-amount"
                              type="number"
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                              min="0.000001"
                              step="0.000001"
                              className="bg-[#243860] text-white border-gray-700"
                            />
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="border-gray-700 text-white hover:bg-[#243860]"
                                    onClick={() => setWithdrawAmount(simBalance)}
                                  >
                                    Max
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Use maximum available SIM</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Withdrawing: {withdrawAmount} SIM</span>
                            <span className="text-gray-400">To your wallet</span>
                          </div>
                        </div>

                        <Button
                          onClick={withdrawTokens}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                          disabled={
                            isLoading ||
                            !withdrawAmount ||
                            Number.parseFloat(withdrawAmount) <= 0 ||
                            Number.parseFloat(withdrawAmount) > Number.parseFloat(simBalance)
                          }
                        >
                          {isLoading ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <ArrowUpFromLine className="mr-2 h-4 w-4" />
                              Withdraw to Wallet
                            </>
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </motion.div>

                {transactions.length > 0 && (
                  <motion.div
                    className="bg-[#0d1829]/50 rounded-lg border border-blue-500/20 p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <h3 className="text-white font-semibold mb-3">Recent Transactions</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-2 rounded bg-[#0d1829] border border-blue-500/10"
                        >
                          <div className="flex items-center">
                            {tx.type === "buy" ? (
                              <ArrowDownToLine className="h-4 w-4 mr-2 text-green-400" />
                            ) : (
                              <ArrowUpFromLine className="h-4 w-4 mr-2 text-blue-400" />
                            )}
                            <div>
                              <div className="text-sm text-white">
                                {tx.type === "buy" ? "Buy" : "Withdraw"} {tx.amount} SIM
                              </div>
                              <div className="text-xs text-gray-400">{formatTime(tx.timestamp)}</div>
                            </div>
                          </div>
                          <div>
                            {tx.status === "pending" ? (
                              <div className="flex items-center text-yellow-400 text-xs">
                                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                Pending
                              </div>
                            ) : tx.status === "success" ? (
                              <div className="flex items-center text-green-400 text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Success
                              </div>
                            ) : (
                              <div className="flex items-center text-red-400 text-xs">
                                <XCircle className="h-3 w-3 mr-1" />
                                Failed
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <motion.div
                  className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <h3 className="text-white font-semibold mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-blue-400" />
                    Important Information
                  </h3>
                  <ul className="text-sm text-gray-300 space-y-1 list-disc pl-5">
                    <li>Make sure you're connected to the correct network (Ethereum Mainnet)</li>
                    <li>Trading incurs gas fees in addition to the token price</li>
                    <li>Tokens bought through the contract are held in the contract until withdrawn</li>
                    <li>Always verify transaction details in your wallet before confirming</li>
                  </ul>
                </motion.div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

