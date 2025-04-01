"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/src/components/ui/badge"
import Layout from "@/src/components/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Skeleton } from "@/src/components/ui/skeleton"
import Link from "next/link"
import {
  DollarSign,
  Activity,
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Tag,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import { Input } from "@/src/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/src/components/ui/alert"

// Define Asset and Transaction types
type Asset = {
  tradeid: string
  name: string
  symbol: string
  quantity: number
  price: number
  totalValue: number
  assetid: string
  img?: string
  collection_id: string | null // Added collection_id
}

type Transaction = {
  id: string
  timestamp: string
  type: string
  amount: string
  status: string
  assetid?: string
  symbol?: string
  name?: string
}

export default function HomePage() {
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [metawallet, setMetawallet] = useState<string | null>(null);
  const [listedAssetIds, setListedAssetIds] = useState<string[]>([]);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [assetSearchTerm, setAssetSearchTerm] = useState("");
  const [transactionSearchTerm, setTransactionSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'assets' | 'transactions'>('assets');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  
  const router = useRouter();

  // Fetch userId and metawallet from localStorage and set redirect flag
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userid");
      const storedMetawallet = localStorage.getItem("metawallet");
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        setShouldRedirect(true);
      }
      if (storedMetawallet) {
        setMetawallet(storedMetawallet);
      } else {
        setMetawallet("N/A");
      }
    }
  }, []);

  // Perform redirect after mount if needed
  useEffect(() => {
    if (shouldRedirect) {
      router.push("/login");
    }
  }, [shouldRedirect, router]);

  // Fetch listed trades to determine which assets are being sold
  useEffect(() => {
    const fetchListedTrades = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('Trade')
          .select('assetid')
          .eq('userid', userId)
          .eq('status', 'Buy');

        if (error) throw error;

        const assetIds = data.map((trade) => trade.assetid);
        setListedAssetIds(assetIds);
      } catch (error) {
        console.error('Error fetching listed trades:', error);
      }
    };

    fetchListedTrades();
  }, [userId]);

  // Fetch data from the API route
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setIsRefreshing(true);
        const response = await fetch('/api/personal', {
          headers: {
            'user-id': userId,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();

        setAddress(data.publicaddress);
        setBalance(data.balance);
        setAssets(data.assets);
        setTransactions(
          data.transactions.map((tx: any) => ({
            id: tx.id,
            timestamp: new Date(tx.timestamp).toLocaleString(),
            type: tx.type,
            amount: tx.amount,
            status: tx.status,
            assetid: tx.assetid,
            symbol: tx.symbol,
            name: tx.name,
          }))
        );
        
        setNotification({
          type: 'success',
          message: 'Data refreshed successfully'
        });
        
        setTimeout(() => {
          setNotification(null);
        }, 3000);
        
      } catch (error) {
        setError('Error fetching data');
        
        setNotification({
          type: 'error',
          message: 'Failed to refresh data'
        });
        
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchData();
  }, [userId]);

  // Copy wallet address to clipboard
  const copyToClipboard = () => {
    if (metawallet) {
      navigator.clipboard.writeText(metawallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle sorting
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort assets
  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(assetSearchTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(assetSearchTerm.toLowerCase())
  );

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key as keyof Asset];
    const bValue = b[sortConfig.key as keyof Asset];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'ascending' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'ascending' 
        ? aValue - bValue
        : bValue - aValue;
    }
    
    return 0;
  });

  // Filter and sort transactions
  const filteredTransactions = transactions.filter(tx => 
    tx.id.toLowerCase().includes(transactionSearchTerm.toLowerCase()) ||
    (tx.name && tx.name.toLowerCase().includes(transactionSearchTerm.toLowerCase())) ||
    (tx.symbol && tx.symbol.toLowerCase().includes(transactionSearchTerm.toLowerCase())) ||
    tx.type.toLowerCase().includes(transactionSearchTerm.toLowerCase()) ||
    tx.status.toLowerCase().includes(transactionSearchTerm.toLowerCase())
  );

  // Refresh data
  const refreshData = () => {
    if (!userId) return;
    setLoading(true);
    
    const fetchData = async () => {
      try {
        setIsRefreshing(true);
        const response = await fetch('/api/personal', {
          headers: {
            'user-id': userId,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();

        setAddress(data.publicaddress);
        setBalance(data.balance);
        setAssets(data.assets);
        setTransactions(
          data.transactions.map((tx: any) => ({
            id: tx.id,
            timestamp: new Date(tx.timestamp).toLocaleString(),
            type: tx.type,
            amount: tx.amount,
            status: tx.status,
            assetid: tx.assetid,
            symbol: tx.symbol,
            name: tx.name,
          }))
        );
        
        setNotification({
          type: 'success',
          message: 'Data refreshed successfully'
        });
        
        setTimeout(() => {
          setNotification(null);
        }, 3000);
        
      } catch (error) {
        setError('Error fetching data');
        
        setNotification({
          type: 'error',
          message: 'Failed to refresh data'
        });
        
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchData();
  };

  if (loading) {
    return (
      <Layout>
        <div className="container px-4 py-8 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-blue-500/30 bg-[#1a2b4b]">
              <CardHeader>
                <Skeleton className="w-64 h-8 bg-gray-700" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="w-full h-12 bg-gray-700" />
                <div className="space-y-2">
                  <Skeleton className="w-full h-8 bg-gray-700" />
                  <Skeleton className="w-full h-8 bg-gray-700" />
                  <Skeleton className="w-full h-8 bg-gray-700" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-full h-8 bg-gray-700" />
                  <Skeleton className="w-full h-8 bg-gray-700" />
                  <Skeleton className="w-full h-8 bg-gray-700" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container px-4 py-8 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-red-500/30 bg-[#1a2b4b]">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">
                  Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-500/50">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button 
                  onClick={refreshData}
                  className="text-white bg-blue-500 hover:bg-blue-600"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (!userId) {
    return (
      <Layout>
        <div className="container px-4 py-8 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-red-500/30 bg-[#1a2b4b]">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">
                  Authentication Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-500/50">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>Please log in to view your assets.</AlertDescription>
                </Alert>
                <Link href="/login">
                  <Button className="text-white bg-blue-500 hover:bg-blue-600">Go to Login</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto">
        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div 
              className="fixed z-50 top-20 right-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert 
                variant={notification.type === 'success' ? 'default' : 'destructive'} 
                className={notification.type === 'success' 
                  ? "bg-green-900/20 border-green-500/50 text-green-400" 
                  : "bg-red-900/20 border-red-500/50"
                }
              >
                {notification.type === 'success' 
                  ? <CheckCircle className="w-4 h-4" /> 
                  : <AlertCircle className="w-4 h-4" />
                }
                <AlertDescription>{notification.message}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8 border-blue-500/30 bg-[#1a2b4b] overflow-hidden">
            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-indigo-900/5 to-purple-900/5"></div>
            
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-3xl font-bold text-white">
                  <DollarSign className="mr-2 text-blue-400" /> Personal Assets
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-400 transition-all border-blue-500/30 hover:bg-blue-500/20"
                  onClick={refreshData}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
              <CardDescription className="mt-2 text-gray-400">
                Manage your digital assets and view transaction history
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative">
              {/* Metawallet Address */}
              <motion.div 
                className="mb-6 bg-[#0d1829]/80 p-4 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h2 className="flex items-center mb-2 text-xl text-white">
                  <Wallet className="mr-2 text-blue-400" /> Wallet Address
                </h2>
                <div className="flex items-center bg-[#1a2b4b] p-2 rounded-md">
                  <div className="flex-1 text-gray-300 truncate">
                    {metawallet}
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
                          onClick={copyToClipboard}
                        >
                          {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copied ? "Copied!" : "Copy to clipboard"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </motion.div>

              {/* Balance */}
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h2 className="flex items-center mb-4 text-2xl font-medium text-white">
                  <Activity className="mr-2 text-blue-400" /> Balance
                </h2>
                <div className="rounded-lg bg-[#0d1829] p-6 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
                  <div className="flex items-end">
                    <span className="text-4xl font-bold text-green-400">
                      {balance.toFixed(2)}
                    </span>
                    <span className="ml-2 text-xl text-gray-400">ETH</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-400">
                    Last updated: {new Date().toLocaleString()}
                  </div>
                </div>
              </motion.div>

              {/* Tabs for Assets and Transactions */}
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="flex mb-4 border-b border-gray-700">
                  <button
                    className={`py-2 px-4 font-medium ${
                      activeTab === 'assets'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('assets')}
                  >
                    <Tag className="inline-block w-4 h-4 mr-2" />
                    Assets
                  </button>
                  <button
                    className={`py-2 px-4 font-medium ${
                      activeTab === 'transactions'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('transactions')}
                  >
                    <Clock className="inline-block w-4 h-4 mr-2" />
                    Transactions
                  </button>
                </div>

                {/* Assets Tab */}
                {activeTab === 'assets' && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="assets"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-medium text-white">Your Assets</h2>
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                            <Input
                              placeholder="Search assets..."
                              value={assetSearchTerm}
                              onChange={(e) => setAssetSearchTerm(e.target.value)}
                              className="pl-10 bg-[#0d1829] border-gray-700 text-white w-60"
                            />
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="text-gray-300 border-gray-700">
                              <Filter className="w-4 h-4 mr-2" />
                                Sort
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#1a2b4b] border-gray-700 text-white">
                              <DropdownMenuItem onClick={() => requestSort('name')}>
                                Sort by Name
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => requestSort('price')}>
                                Sort by Price
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => requestSort('totalValue')}>
                                Sort by Total Value
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="overflow-x-auto border rounded-lg border-blue-500/20">
                        <table className="min-w-full bg-[#0d1829] text-center">
                          <thead>
                            <tr className="bg-[#1a2b4b]">
                              <th className="px-4 py-3 text-white border-b border-gray-700">Preview</th>
                              <th 
                                className="px-4 py-3 text-white transition-colors border-b border-gray-700 cursor-pointer hover:text-blue-400"
                                onClick={() => requestSort('name')}
                              >
                                <div className="flex items-center justify-center">
                                  Asset
                                  {sortConfig?.key === 'name' && (
                                    sortConfig.direction === 'ascending' 
                                      ? <ChevronUp className="w-4 h-4 ml-1" /> 
                                      : <ChevronDown className="w-4 h-4 ml-1" />
                                  )}
                                </div>
                              </th>
                              <th className="px-4 py-3 text-white border-b border-gray-700">Amount</th>
                              <th 
                                className="px-4 py-3 text-white transition-colors border-b border-gray-700 cursor-pointer hover:text-blue-400"
                                onClick={() => requestSort('price')}
                              >
                                <div className="flex items-center justify-center">
                                  Price (ETH)
                                  {sortConfig?.key === 'price' && (
                                    sortConfig.direction === 'ascending' 
                                      ? <ChevronUp className="w-4 h-4 ml-1" /> 
                                      : <ChevronDown className="w-4 h-4 ml-1" />
                                  )}
                                </div>
                              </th>
                              <th 
                                className="px-4 py-3 text-white transition-colors border-b border-gray-700 cursor-pointer hover:text-blue-400"
                                onClick={() => requestSort('totalValue')}
                              >
                                <div className="flex items-center justify-center">
                                  Total Value
                                  {sortConfig?.key === 'totalValue' && (
                                    sortConfig.direction === 'ascending' 
                                      ? <ChevronUp className="w-4 h-4 ml-1" /> 
                                      : <ChevronDown className="w-4 h-4 ml-1" />
                                  )}
                                </div>
                              </th>
                              <th className="px-4 py-3 text-white border-b border-gray-700">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedAssets.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="py-8 text-center text-gray-400">
                                  No assets found
                                </td>
                              </tr>
                            ) : (
                              sortedAssets.map((asset, index) => (
                                <motion.tr 
                                  key={index} 
                                  className="hover:bg-[#1a2b4b] transition-colors"
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: index * 0.05 }}
                                  whileHover={{ backgroundColor: 'rgba(26, 43, 75, 0.8)' }}
                                >
                                  <td className="px-4 py-3 border-b border-gray-700">
                                    <div className="relative w-12 h-12 mx-auto overflow-hidden border rounded-md border-blue-500/20 group">
                                      <Image
                                        src={asset.img || '/placeholder.svg'}
                                        alt={`${asset.name} preview`}
                                        fill
                                        className="object-contain transition-transform duration-300 rounded-sm group-hover:scale-110"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                                        }}
                                      />
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-white border-b border-gray-700">
                                    <div className="flex items-center justify-center">
                                      <Badge variant="outline" className="mr-2 border-blue-500/30 bg-blue-500/10">
                                        {asset.symbol.toUpperCase()}
                                      </Badge>
                                      {asset.name}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-white border-b border-gray-700">{asset.quantity}</td>
                                  <td className="px-4 py-3 text-white border-b border-gray-700">{asset.price.toFixed(2)}</td>
                                  <td className="px-4 py-3 font-medium text-white border-b border-gray-700">{asset.totalValue.toFixed(2)}</td>
                                  <td className="px-4 py-3 text-white border-b border-gray-700">
                                    {listedAssetIds.includes(asset.assetid) ? (
                                      <Badge className="px-3 py-1 text-yellow-400 bg-yellow-500/20">
                                        Selling
                                      </Badge>
                                    ) : (
                                      <Link
                                        href={{
                                          pathname: '/markets/sell',
                                          query: { 
                                            name: asset.name, 
                                            price: asset.price.toFixed(2),
                                            assetid: asset.assetid, // Added assetid
                                            collection_id: asset.collection_id || '', // Added collection_id
                                          },
                                        }}
                                      >
                                        <Button 
                                          variant="outline" 
                                          className="text-white transition-all border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50"
                                        >
                                          Sell
                                        </Button>
                                      </Link>
                                    )}
                                  </td>
                                </motion.tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}

               {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="transactions"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-medium text-white">Transaction History</h2>
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                            <Input
                              placeholder="Search transactions..."
                              value={transactionSearchTerm}
                              onChange={(e) => setTransactionSearchTerm(e.target.value)}
                              className="pl-10 bg-[#0d1829] border-gray-700 text-white w-60"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto border rounded-lg border-blue-500/20">
                        <table className="min-w-full bg-[#0d1829] text-center">
                          <thead>
                            <tr className="bg-[#1a2b4b]">
                              <th className="px-4 py-3 text-white border-b border-gray-700">Transaction ID</th>
                              <th className="px-4 py-3 text-white border-b border-gray-700">Asset</th>
                              <th className="px-4 py-3 text-white border-b border-gray-700">Timestamp</th>
                              <th className="px-4 py-3 text-white border-b border-gray-700">Type</th>
                              <th className="px-4 py-3 text-white border-b border-gray-700">Amount</th>
                              <th className="px-4 py-3 text-white border-b border-gray-700">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTransactions.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="py-8 text-center text-gray-400">
                                  No transactions found
                                </td>
                              </tr>
                            ) : (
                              filteredTransactions.map((tx, index) => (
                                <motion.tr 
                                  key={tx.id} 
                                  className="hover:bg-[#1a2b4b] transition-colors"
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: index * 0.05 }}
                                  whileHover={{ backgroundColor: 'rgba(26, 43, 75, 0.8)' }}
                                >
                                  <td className="px-4 py-3 font-mono text-sm text-white border-b border-gray-700">
                                    {tx.id.substring(0, 8)}...
                                  </td>
                                  <td className="px-4 py-3 text-white border-b border-gray-700">
                                    {tx.symbol && tx.name ? (
                                      <div className="flex items-center justify-center">
                                        <Badge
                                          variant="outline"
                                          className="mr-2 border-blue-500/30 bg-blue-500/10"
                                        >
                                          {tx.symbol.toUpperCase()}
                                        </Badge>
                                        {tx.name}
                                      </div>
                                    ) : (
                                      "N/A"
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-white border-b border-gray-700">{tx.timestamp}</td>
                                  <td className="px-4 py-3 border-b border-gray-700">
                                    <Badge className={`
                                      ${tx.type.toLowerCase() === 'buy' ? 'bg-green-500/20 text-green-400' : 
                                        tx.type.toLowerCase() === 'sell' ? 'bg-red-500/20 text-red-400' : 
                                        'bg-blue-500/20 text-blue-400'}
                                    `}>
                                      <span className="flex items-center">
                                        {tx.type.toLowerCase() === 'buy' ? (
                                          <ArrowUpRight className="w-3 h-3 mr-1" />
                                        ) : tx.type.toLowerCase() === 'sell' ? (
                                          <ArrowDownRight className="w-3 h-3 mr-1" />
                                        ) : null}
                                        {tx.type}
                                      </span>
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 text-white border-b border-gray-700">{tx.amount}</td>
                                  <td className="px-4 py-3 border-b border-gray-700">
                                    <Badge className={`
                                      ${tx.status.toLowerCase() === 'completed' ? 'bg-green-500/20 text-green-400' : 
                                        tx.status.toLowerCase() === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                                        tx.status.toLowerCase() === 'failed' ? 'bg-red-500/20 text-red-400' : 
                                        'bg-gray-500/20 text-gray-400'}
                                    `}>
                                      {tx.status}
                                    </Badge>
                                  </td>
                                </motion.tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
                </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
