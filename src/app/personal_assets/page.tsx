"use client"

import { useEffect, useState } from "react"
import Layout from "@/src/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
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

// DigitalAssets Component
const DigitalAssets: React.FC<DigitalAssetsProps> = ({ balance, assets, transactions }) => {
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
            {/* User Balance */}
            <div className="mb-6">
              <h2 className="flex items-center mb-4 text-2xl font-medium text-white">
                <Activity className="mr-2" /> Balance (USD)
              </h2>
              <div className="bg-[#0d1829] p-6 rounded-lg">
                <span className="text-4xl font-bold text-green-400">${balance.toLocaleString()}</span>
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
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
