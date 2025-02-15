"use client"

import { useEffect, useState } from "react"
import Layout from "@/src/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
<<<<<<< HEAD
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Skeleton } from "@/src/components/ui/skeleton"
import Link from "next/link" // Add Link import for navigation
import { DollarSign, Activity, Clock } from "lucide-react"

// Define the types for the props
type Asset = {
  name: string
  amount: number
  price: number
}

type Transaction = {
  id: string
  timestamp: string
  type: string
  amount: string
  status: string
}

type DigitalAssetsProps = {
  balance: number
  assets: Asset[]
  transactions: Transaction[]
}
=======
import Layout from "../../components/layout"
import { fakeSmartContract } from '@/src/components/trading/transactions/smart-contract-real';
import TradeHistory from '@/src/components/trading/transactions/trading-history';

interface Trade {
  txHash: string;
  buyer: string;
  seller: string;
  asset: string;
  amount: number;
  price: number;
  sellerDeposit: number;
  status: string;
  timestamp: string;
  userABalanceAtTrade: string;
}
export default function HomePage() {
  const [address, setAddress] = useState<string>('0x1234567890abcdef');
  const [balances, setBalances] = useState({ USD: 0, BTC: 0 });
  const [depositAmount, setDepositAmount] = useState("");
  const [refresh, setRefresh] = useState(false);

  const updateBalance = () => {
    setBalances(fakeSmartContract.getBalance("UserA"));
  };

  const handleDepositUSD = () => {
    fakeSmartContract.depositUSD("UserA", Number(depositAmount));
    setDepositAmount("");
    setTimeout(() => {
      updateBalance();
    }, 100);
  };

  const handleResetUSD = () => {
    fakeSmartContract.resetUSDBalance("UserA");
    setTimeout(() => {
      updateBalance();
      setRefresh((prev) => !prev); // Force a component re-render
    }, 100);
  };

  useEffect(() => {
    updateBalance();
  }, []);
>>>>>>> 1975e2af011f777d22c3cefc487ba98322847ccf

  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto">
        <Card className="bg-[#1a2b4b] border-blue-500/30 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-3xl font-bold text-white">
              <DollarSign className="mr-2" /> Personal Assets
            </CardTitle>
          </CardHeader>
          <CardContent>

            {/* User Address */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="left-3 text-xl text-white">Address: {address}</h2>
              </div>
            </div>

            {/* User Balance */}
            <div className="mb-6">
<<<<<<< HEAD
              <h2 className="flex items-center mb-4 text-2xl font-medium text-white">
                <Activity className="mr-2" /> Balance (USD)
              </h2>
              <div className="bg-[#0d1829] p-6 rounded-lg">
                <span className="text-4xl font-bold text-green-400">${balance.toLocaleString()}</span>
              </div>
=======
              <div className="flex justify-between items-center mb-4">
                <h2 className="left-3 text-xl font-medium text-white">Personal Balance</h2>
              </div>
              <table className="min-w-full bg-[#1a2b4b] border border-gray-700 text-center">
                <thead>
                  <tr className="bg-[#0d1829]">
                    <th className="py-2 px-4 border-b text-white">USD</th>
                  </tr>
                </thead>
                <tbody className="bg-[#06203E]">
                  <tr className="hover:bg-[#0d1829]">
                    <td className="py-2 px-4 border-b text-white">${balances.USD}</td>
                  </tr>
                </tbody>
                <thead>
                  <tr className="bg-[#0d1829]">
                    <th className="py-2 px-4 border-b text-white">BTC</th>
                  </tr>
                </thead>
                <tbody className="bg-[#06203E]">
                  <tr className="hover:bg-[#0d1829]">
                    <td className="py-2 px-4 border-b text-white">{balances.BTC}</td>
                  </tr>
                </tbody>
              </table>
>>>>>>> 1975e2af011f777d22c3cefc487ba98322847ccf
            </div>

            {/* User Balance */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="left-3 text-xl font-medium text-white">Deposit USD</h2>
              </div>
              <div>
                <input
                  className="bg-transparent"
                  placeholder="Deposit Amount"
                  type="text"
                  inputMode="numeric"
                  value={depositAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d*$/.test(value)) {
                      setDepositAmount(value);
                    }
                  }}
                />
                <button onClick={handleDepositUSD}>Deposit</button>
              </div>
            </div>

            {/* User Assets */}
            <div className="mb-6">
              <h2 className="mb-4 text-2xl font-medium text-white">Assets</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xl text-white">Cryptocurrency</TableHead>
                      <TableHead className="text-xl text-right text-white">Amount</TableHead>
                      <TableHead className="text-xl text-right text-white">Price (USD)</TableHead>
                      <TableHead className="text-xl text-right text-white">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset, index) => (
                      <TableRow key={index} className="hover:bg-[#0d1829] transition-colors">
                        <TableCell className="font-medium text-white v">
                          <Badge variant="outline" className="font-bold">
                            {asset.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-white">{asset.amount.toFixed(6)}</TableCell>
                        <TableCell className="text-right text-white">${asset.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Link href="/trade" passHref>
                            <Button
                              size="sm"
                              className="text-white bg-blue-500 hover:bg-blue-600"
                            >
                              Trade
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
<<<<<<< HEAD
            </div>

            {/* Transactions History */}
            <div>
              <h2 className="flex items-center mb-4 text-2xl font-medium text-white">
                <Clock className="mr-2" /> Transaction History
              </h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xl text-white">Transaction ID</TableHead>
                      <TableHead className="text-xl text-white">Timestamp</TableHead>
                      <TableHead className="text-xl text-white">Type</TableHead>
                      <TableHead className="text-xl text-right text-white">Amount</TableHead>
                      <TableHead className="text-xl text-right text-white">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-[#0d1829] transition-colors">
                        <TableCell className="font-medium text-white">{tx.id}</TableCell>
                        <TableCell className="text-gray-300">{tx.timestamp}</TableCell>
                        <TableCell className="text-gray-300">{tx.type}</TableCell>
                        <TableCell className="text-right text-white">{tx.amount}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={
                              tx.status === "Completed"
                                ? "bg-green-500 hover:bg-green-600"
                                : tx.status === "Pending"
                                  ? "bg-yellow-500 hover:bg-yellow-600"
                                  : "bg-red-500 hover:bg-red-600"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
=======
              <table className="min-w-full bg-[#0d1829] border border-gray-700 text-center">
                <thead>
                  <tr className="bg-[#0d1829] text-white">
                    <th className="py-2 px-4 border-b">Cryptocurrency</th>
                    <th className="py-2 px-4 border-b">Amount</th>
                    <th className="py-2 px-4 border-b">Price (USD)</th>
                    <th className="py-2 px-4 border-b">Total</th>
                    <th className="py-2 px-4 border-b">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-[#06203E]">

                  {/* <tr key={index} className="hover:bg-[#0d1829] text-white"> */}
                  <tr className="hover:bg-[#0d1829] text-white">
                    <td className="py-2 px-4 border-b">BTC</td>
                    <td className="py-2 px-4 border-b">{balances.BTC}</td>
                    <td className="py-2 px-4 border-b">100$</td>
                    <td className="py-2 px-4 border-b">{balances.BTC * 100}$</td>
                    <td className="py-2 px-4 border-b">
                      <a href={`/trade`} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Trade</a>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

            {/* Transactions History
            <div className="mb-6">
              <h2 className="text-xl font-medium text-white mb-3">Transaction History</h2>
              <table className="min-w-full bg-[#1a2b4b] border border-gray-700 text-center">
                <thead>
                  <tr className="bg-[#0d1829] text-white">
                    <th className="py-2 px-4 border-b">Timestamp</th>
                    <th className="py-2 px-4 border-b">Action</th>
                    <th className="py-2 px-4 border-b">Tx</th>
                    <th className="py-2 px-4 border-b">Asset</th>
                    <th className="py-2 px-4 border-b">Amount</th>
                    <th className="py-2 px-4 border-b">Price</th>
                    <th className="py-2 px-4 border-b">Status</th>
                    <th className="py-2 px-4 border-b">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-[#06203E]">

                  <tr key={tx.id} className="hover:bg-[#0d1829] text-white">
                      <td className="py-2 px-4 border-b">{tx.id}</td>
                      <td className="py-2 px-4 border-b">{tx.timestamp}</td>
                      <td className="py-2 px-4 border-b">{tx.type}</td>
                      <td className="py-2 px-4 border-b">{tx.amount}</td>
                      <td className="py-2 px-4 border-b">{tx.status}</td>
                    </tr>

                  

                </tbody>
              </table>
            </div> */}
            <TradeHistory/>
>>>>>>> 1975e2af011f777d22c3cefc487ba98322847ccf
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
<<<<<<< HEAD
}

// HomePage Component
const HomePage: React.FC = () => {
  const [balance, setBalance] = useState<number>(0)
  const [assets, setAssets] = useState<Asset[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from the fake API
  useEffect(() => {
    const userId = "personal"
    fetch(`/api/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setBalance(data.balance)
          setAssets(data.assets)
          setTransactions(data.transactions)
        }
      })
      .catch((err) => setError("Error fetching data"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="container px-4 py-8 mx-auto">
          <Card className="bg-[#1a2b4b] border-blue-500/30">
            <CardHeader>
              <Skeleton className="w-64 h-8 bg-gray-700" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <Skeleton key={index} className="w-full h-12 bg-gray-700" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="container px-4 py-8 mx-auto">
          <Card className="bg-[#1a2b4b] border-red-500/30">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  return <DigitalAssets balance={balance} assets={assets} transactions={transactions} />
}

export default HomePage
=======
}
>>>>>>> 1975e2af011f777d22c3cefc487ba98322847ccf
