"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Layout from "@/src/components/layout"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { supabase } from "@/lib/supabaseClient"
import { motion } from "framer-motion"
import {
  CoinsIcon as CoinIcon,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  DollarSign,
  Tag,
  ImageIcon,
  FolderPlus,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import platformNFTABI from "@/contracts/PlatformNFT.json"
import { ethers } from "ethers"

export default function CreateCurrencyPage() {
  const PLATFORM_NFT_ADDRESS = "0xe4d6664D5b191960273E9aE2eA698DA30FDF519f"
  const [formData, setFormData] = useState({ symbol: "", name: "", price: "", collectionId: "" })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [formStep, setFormStep] = useState(0)
  const [collections, setCollections] = useState<any[]>([])
  const [createNewCollection, setCreateNewCollection] = useState(false)
  const [newCollectionData, setNewCollectionData] = useState({ name: "" })
  const [newCollectionImage, setNewCollectionImage] = useState<File | null>(null)
  const [newCollectionPreviewUrl, setNewCollectionPreviewUrl] = useState<string | null>(null)

  // Fetch userId and collections
  useEffect(() => {
    const fetchUserAndCollections = async () => {
      if (typeof window !== "undefined") {
        const storedUserId = localStorage.getItem("userid")
        if (storedUserId) {
          setUserId(storedUserId)
        } else {
          const response = await fetch("/api/auth/session")
          const { data: { session } } = await response.json()
          if (session) {
            setUserId(session.user.id)
            localStorage.setItem("userid", session.user.id)
          } else {
            setErrors({ general: "Please log in to create a currency." })
            router.push("/login")
          }
        }
      }

      if (userId) {
        const { data, error } = await supabase.from("Collection").select("*")
        if (error) {
          console.error("Error fetching collections:", error)
          setErrors({ general: `Failed to load collections: ${error.message}` })
        } else {
          setCollections(data || [])
        }
      }
    }
    fetchUserAndCollections()
  }, [userId, router])

  // Generate preview URLs
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [selectedFile])

  useEffect(() => {
    if (newCollectionImage) {
      const url = URL.createObjectURL(newCollectionImage)
      setNewCollectionPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [newCollectionImage])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === "symbol") {
      setFormData((prev) => ({ ...prev, symbol: value.toUpperCase() }))
    }
  }

  const handleNewCollectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewCollectionData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.symbol) newErrors.symbol = "Symbol is required"
    if (formData.symbol.length !== 3 || formData.symbol !== formData.symbol.toUpperCase()) {
      newErrors.symbol = "Symbol must be 3 characters and uppercase"
    }
    if (!formData.name) newErrors.name = "Name is required"
    if (!formData.price) newErrors.price = "Price is required"
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "Price must be a positive number"
    }
    if (!formData.collectionId && !createNewCollection) {
      newErrors.collection = "Please select a collection or create a new one"
    }
    if (!selectedFile) newErrors.image = "Image is required"
    if (createNewCollection) {
      if (!newCollectionData.name) newErrors.collectionName = "Collection name is required"
      if (!newCollectionImage) newErrors.collectionImage = "Collection image is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const fetchWithTimeout = async (url: string, timeout = 3000) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" } })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm() || !userId) {
      if (!userId) setErrors({ general: "Please log in to create a currency" })
      return
    }

    setLoading(true)
    setErrors({})

    try {
      if (!window.ethereum) throw new Error("MetaMask required")

      const { data: user, error: userError } = await supabase
        .from("User")
        .select("metawallet")
        .eq("userid", userId)
        .single()

      if (userError || !user) throw new Error("Failed to fetch user wallet address")
      const registeredWallet = user.metawallet?.toLowerCase()
      if (!registeredWallet) throw new Error("No wallet address found for the user")

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const currentAddress = await signer.getAddress()

      if (currentAddress.toLowerCase() !== registeredWallet) {
        throw new Error(`Connected wallet does not match registered wallet. Current: ${currentAddress}, Registered: ${registeredWallet}`)
      }

      const contract = new ethers.Contract(PLATFORM_NFT_ADDRESS, platformNFTABI, signer)
      const tx = await contract.mint(currentAddress)
      const receipt = await tx.wait()
      const iface = new ethers.Interface(platformNFTABI)
      const log = receipt.logs[0] ? iface.parseLog(receipt.logs[0]) : null
      if (!log) throw new Error("No valid event log found")
      const tokenId = log.args.tokenId.toString()

      const assetId = uuidv4()
      const priceHistoryId = uuidv4()
      let collectionId = formData.collectionId

      if (createNewCollection) {
        const collectionIdNew = uuidv4()
        const file = newCollectionImage!
        const fileExt = file.name.split(".").pop()
        const fileName = `${collectionIdNew}.${fileExt}`

        const { error: uploadError } = await supabase.storage.from("collection-img").upload(fileName, file)
        if (uploadError) throw new Error(`Failed to upload collection image: ${uploadError.message}`)

        const { data: { publicUrl } } = supabase.storage.from("collection-img").getPublicUrl(fileName)

        const collectionResponse = await fetch("/api/create", {
          method: "POST",
          headers: { "Content-Type": "application/json", "user-id": userId },
          body: JSON.stringify({
            table: "Collection",
            data: {
              collection_id: collectionIdNew,
              name: newCollectionData.name,
              creatorid: userId,
              image: publicUrl,
              createdat: new Date().toISOString(),
            },
          }),
        })

        if (!collectionResponse.ok) {
          const errorData = await collectionResponse.json()
          throw new Error(errorData.error || "Failed to create collection")
        }
        collectionId = collectionIdNew
      }

      const file = selectedFile!
      const fileExt = file.name.split(".").pop()
      const fileName = `${assetId}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("nft-img").upload(fileName, file)
      if (uploadError) throw new Error(`Failed to upload file: ${uploadError.message}`)

      const { data: { publicUrl } } = supabase.storage.from("nft-img").getPublicUrl(fileName)

      const tokenURI = await contract.tokenURI(tokenId)
      const metadata = await fetchWithTimeout(tokenURI)
        .then(r => r.json())
        .catch(() => ({ name: formData.name, image: publicUrl }))

      await window.ethereum?.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC721",
          options: {
            address: PLATFORM_NFT_ADDRESS,
            tokenId: tokenId,
            name: formData.name,
            symbol: formData.symbol,
            image: publicUrl,
            decimals: formData.price,
          },
        },
      })

      const assetResponse = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "user-id": userId },
        body: JSON.stringify({
          table: "Asset",
          data: {
            assetid: assetId,
            mint: tokenId,
            symbol: formData.symbol,
            name: formData.name,
            assettype: "NFT",
            createdat: new Date().toISOString(),
            isactive: true,
            img: publicUrl,
            collection_id: collectionId,
            creatorid: userId,
          },
        }),
      })

      if (!assetResponse.ok) {
        const errorData = await assetResponse.json()
        throw new Error(errorData.error || "Failed to insert into Asset table")
      }

      const priceHistoryResponse = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "user-id": userId },
        body: JSON.stringify({
          table: "PriceHistory",
          data: {
            pricehistoryid: priceHistoryId,
            assetid: assetId,
            price: Number(formData.price),
            currencypair: `${formData.symbol}/ETH`,
            timestamp: new Date().toISOString(),
            source: "User",
          },
        }),
      })

      if (!priceHistoryResponse.ok) {
        const errorData = await priceHistoryResponse.json()
        throw new Error(errorData.error || "Failed to insert into PriceHistory table")
      }

      setSuccess(true)
      setTimeout(() => router.push("/personal-assets"), 2000)
    } catch (error: any) {
      if (error.code === 4001 || error.message?.includes("user denied") || error.message?.includes("rejected")) {
        setErrors({ general: "Create process canceled" })
      } else {
        setErrors({
          general: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
  }

  const handleNewCollectionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setNewCollectionImage(file)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  const nextStep = () => {
    const currentErrors: Record<string, string> = {}
    if (formStep === 0) {
      if (!formData.symbol) currentErrors.symbol = "Symbol is required"
      if (formData.symbol.length !== 3 || formData.symbol !== formData.symbol.toUpperCase()) {
        currentErrors.symbol = "Symbol must be 3 characters and uppercase"
      }
      if (!formData.name) currentErrors.name = "Name is required"
    } else if (formStep === 1) {
      if (!formData.price) currentErrors.price = "Price is required"
      if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
        currentErrors.price = "Price must be a positive number"
      }
    } else if (formStep === 2) {
      if (!formData.collectionId && !createNewCollection) {
        currentErrors.collection = "Please select a collection or create a new one"
      }
      if (createNewCollection) {
        if (!newCollectionData.name) currentErrors.collectionName = "Collection name is required"
        if (!newCollectionImage) currentErrors.collectionImage = "Collection image is required"
      }
    }
    setErrors(currentErrors)
    if (Object.keys(currentErrors).length === 0) setFormStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setFormStep((prev) => prev - 1)
    if (formStep === 2) {
      setCreateNewCollection(false)
      setNewCollectionData({ name: "" })
      setNewCollectionImage(null)
      setNewCollectionPreviewUrl(null)
    }
  }

  return (
    <Layout>
      <div className="container px-4 py-12 mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl mx-auto">
          {success ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
              <Card className="border-green-500/30 bg-[#1a2b4b]">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-center text-white">Success!</CardTitle>
                  <CardDescription className="text-center text-gray-300">Your currency has been created successfully.</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-gray-300">
                  <p>Redirecting you to your personal assets...</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="border-blue-500/30 bg-[#1a2b4b] overflow-hidden">
              <CardHeader className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-4">
                    <motion.div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20" whileHover={{ scale: 1.05, rotate: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                      <CoinIcon className="w-8 h-8 text-blue-400" />
                    </motion.div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-center text-white">Create New Currency</CardTitle>
                  <CardDescription className="text-center text-gray-300">Launch your own digital asset on the TradePro platform</CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    {[0, 1, 2, 3].map((step) => (
                      <motion.div
                        key={step}
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${formStep === step ? "bg-blue-500 text-white" : formStep > step ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-gray-700/50 text-gray-400"}`}
                        animate={formStep >= step ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {formStep > step ? <CheckCircle className="w-4 h-4" /> : <span>{step + 1}</span>}
                      </motion.div>
                    ))}
                  </div>
                  <div className="relative h-1 bg-gray-700 rounded-full">
                    <motion.div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full" initial={{ width: "0%" }} animate={{ width: `${(formStep / 3) * 100}%` }} transition={{ duration: 0.3 }} />
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {formStep === 0 && (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                      <motion.div variants={itemVariants}>
                        <div className="flex items-center mb-2">
                          <Tag className="w-4 h-4 mr-2 text-blue-400" />
                          <Label htmlFor="symbol" className="text-white">Symbol (3 characters)</Label>
                        </div>
                        <div className="relative">
                          <Input
                            type="text"
                            id="symbol"
                            name="symbol"
                            placeholder="BTC"
                            className="pl-10 bg-[#243860] text-white border-gray-700 focus:border-blue-500"
                            value={formData.symbol}
                            onChange={handleChange}
                            maxLength={3}
                            disabled={loading}
                          />
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-gray-400">$</span>
                          </div>
                        </div>
                        {errors.symbol && (
                          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center mt-1 text-sm text-red-500">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.symbol}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <div className="flex items-center mb-2">
                          <CoinIcon className="w-4 h-4 mr-2 text-blue-400" />
                          <Label htmlFor="name" className="text-white">Currency Name</Label>
                        </div>
                        <Input
                          type="text"
                          id="name"
                          name="name"
                          placeholder="Bitcoin"
                          className="bg-[#243860] text-white border-gray-700 focus:border-blue-500"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {errors.name && (
                          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center mt-1 text-sm text-red-500">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.name}
                          </motion.p>
                        )}
                      </motion.div>
                    </motion.div>
                  )}

                  {formStep === 1 && (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                      <motion.div variants={itemVariants}>
                        <div className="flex items-center mb-2">
                          <DollarSign className="w-4 h-4 mr-2 text-blue-400" />
                          <Label htmlFor="price" className="text-white">Initial Price (ETH)</Label>
                        </div>
                        <div className="relative">
                          <Input
                            type="text"
                            id="price"
                            name="price"
                            placeholder="0.05"
                            className="pl-10 bg-[#243860] text-white border-gray-700 focus:border-blue-500"
                            value={formData.price}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-gray-400">Ξ</span>
                          </div>
                        </div>
                        {errors.price && (
                          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center mt-1 text-sm text-red-500">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.price}
                          </motion.p>
                        )}
                        <div className="mt-2 text-sm text-gray-400">
                          <p>This will be the initial trading price of your currency.</p>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {formStep === 2 && (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                      {!createNewCollection ? (
                        <>
                          <motion.div variants={itemVariants}>
                            <div className="flex items-center mb-2">
                              <FolderPlus className="w-4 h-4 mr-2 text-blue-400" />
                              <Label className="text-white">Select Collection</Label>
                            </div>
                            {collections.length > 0 ? (
                              <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, collectionId: value }))}>
                                <SelectTrigger className="bg-[#243860] text-white border-gray-700">
                                  <SelectValue placeholder="Select a collection" />
                                </SelectTrigger>
                                <SelectContent>
                                  {collections.map((collection) => (
                                    <SelectItem key={collection.collection_id} value={collection.collection_id}>
                                      {collection.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <p className="text-gray-400">No collections found. Create a new one below.</p>
                            )}
                            {errors.collection && (
                              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center mt-1 text-sm text-red-500">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.collection}
                              </motion.p>
                            )}
                          </motion.div>
                          <motion.div variants={itemVariants}>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setCreateNewCollection(true)}
                              className="w-full border-gray-700 text-white hover:bg-[#243860]"
                            >
                              Create New Collection
                            </Button>
                          </motion.div>
                        </>
                      ) : (
                        <>
                          <motion.div variants={itemVariants}>
                            <div className="flex items-center mb-2">
                              <FolderPlus className="w-4 h-4 mr-2 text-blue-400" />
                              <Label htmlFor="collectionName" className="text-white">Collection Name</Label>
                            </div>
                            <Input
                              type="text"
                              id="collectionName"
                              name="name"
                              placeholder="My Collection"
                              className="bg-[#243860] text-white border-gray-700 focus:border-blue-500"
                              value={newCollectionData.name}
                              onChange={handleNewCollectionChange}
                              disabled={loading}
                            />
                            {errors.collectionName && (
                              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center mt-1 text-sm text-red-500">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.collectionName}
                              </motion.p>
                            )}
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <div className="flex items-center mb-2">
                              <ImageIcon className="w-4 h-4 mr-2 text-blue-400" />
                              <Label htmlFor="collectionImage" className="text-white">Collection Image</Label>
                            </div>
                            <div className="p-4 text-center transition-colors border-2 border-gray-700 border-dashed rounded-lg hover:border-blue-500/50">
                              <input
                                type="file"
                                id="collectionImage"
                                accept="image/*"
                                onChange={handleNewCollectionFileChange}
                                className="hidden"
                                disabled={loading}
                              />
                              {newCollectionPreviewUrl ? (
                                <div className="space-y-4">
                                  <div className="relative w-32 h-32 mx-auto overflow-hidden border-4 rounded-full border-blue-500/30">
                                    <img src={newCollectionPreviewUrl} alt="Collection Preview" className="object-cover w-full h-full" />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => document.getElementById("collectionImage")?.click()}
                                    className="border-gray-700 text-white hover:bg-[#243860]"
                                    disabled={loading}
                                  >
                                    Change Image
                                  </Button>
                                </div>
                              ) : (
                                <label htmlFor="collectionImage" className="flex flex-col items-center justify-center h-32 cursor-pointer">
                                  <Upload className="w-10 h-10 mb-2 text-gray-400" />
                                  <p className="text-gray-400">Click to upload image</p>
                                  <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                </label>
                              )}
                            </div>
                            {errors.collectionImage && (
                              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center mt-1 text-sm text-red-500">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.collectionImage}
                              </motion.p>
                            )}
                          </motion.div>
                        </>
                      )}
                    </motion.div>
                  )}

                  {formStep === 3 && (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                      <motion.div variants={itemVariants}>
                        <div className="flex items-center mb-2">
                          <ImageIcon className="w-4 h-4 mr-2 text-blue-400" />
                          <Label htmlFor="image" className="text-white">Currency Image</Label>
                        </div>
                        <div className="p-4 text-center transition-colors border-2 border-gray-700 border-dashed rounded-lg hover:border-blue-500/50">
                          <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={loading}
                          />
                          {previewUrl ? (
                            <div className="space-y-4">
                              <div className="relative w-32 h-32 mx-auto overflow-hidden border-4 rounded-full border-blue-500/30">
                                <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="object-cover w-full h-full" />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById("image")?.click()}
                                className="border-gray-700 text-white hover:bg-[#243860]"
                                disabled={loading}
                              >
                                Change Image
                              </Button>
                            </div>
                          ) : (
                            <label htmlFor="image" className="flex flex-col items-center justify-center h-32 cursor-pointer">
                              <Upload className="w-10 h-10 mb-2 text-gray-400" />
                              <p className="text-gray-400">Click to upload image</p>
                              <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                            </label>
                          )}
                        </div>
                        {errors.image && (
                          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center mt-1 text-sm text-red-500">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.image}
                          </motion.p>
                        )}
                      </motion.div>

                      {formData.symbol && formData.name && formData.price && (
                        <motion.div variants={itemVariants} className="mt-6">
                          <h3 className="mb-2 text-sm font-medium text-white">Preview</h3>
                          <div className="bg-[#0d1829] rounded-lg p-4 border border-blue-500/20">
                            <div className="flex items-center">
                              <div className="w-12 h-12 mr-3 overflow-hidden rounded-full bg-blue-500/20">
                                {previewUrl ? (
                                  <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="object-cover w-full h-full" />
                                ) : (
                                  <div className="flex items-center justify-center w-full h-full">
                                    <CoinIcon className="w-6 h-6 text-blue-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <span className="font-bold text-white">{formData.name}</span>
                                  <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">${formData.symbol}</span>
                                </div>
                                <div className="font-medium text-blue-400">Ξ {formData.price} ETH</div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {errors.general && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                      <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>{errors.general}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  <motion.div className="flex justify-between mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    {formStep > 0 ? (
                      <Button type="button" variant="outline" onClick={prevStep} className="border-gray-700 text-white hover:bg-[#243860]" disabled={loading}>
                        Previous
                      </Button>
                    ) : (
                      <div></div>
                    )}

                    {formStep < 3 ? (
                      <Button type="button" onClick={nextStep} className="text-white bg-blue-500 hover:bg-blue-600" disabled={loading}>
                        Next
                      </Button>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="submit"
                              className="text-white bg-blue-500 hover:bg-blue-600"
                              disabled={loading || !formData.symbol || !formData.name || !formData.price || !selectedFile}
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Creating...
                                </>
                              ) : (
                                "Create Currency"
                              )}
                            </Button>
                          </TooltipTrigger>
                          {(!formData.symbol || !formData.name || !formData.price || !selectedFile) && (
                            <TooltipContent>
                              <p>Please complete all required fields</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </Layout>
  )
}