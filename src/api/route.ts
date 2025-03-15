import { NextResponse } from "next/server"
import data from "@/data/data.json"

interface Asset {
  AssetID: number
  name: string
  shortname: string
  value: number
  change: number
  volume: string
  marketCap: string
}

interface TransformedCrypto {
  id: number
  symbol: string
  name: string
  price: number
  change: number
  volume: string
  marketCap: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase() || ""
    const sortBy = searchParams.get("sortBy") || "name"
    const sortOrder = searchParams.get("sortOrder") || "asc"
    const minPrice = Number.parseFloat(searchParams.get("minPrice") || "0")
    const maxPrice = Number.parseFloat(searchParams.get("maxPrice") || "1000000")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    // Ensure assets exists and is an array
    if (!Array.isArray(data.assets)) {
      throw new Error("Invalid data format: assets is not an array")
    }

    // Filter data based on search term and price range
    let filteredData = data.assets.filter(
      (asset: Asset) =>
        (asset.name.toLowerCase().includes(search) || asset.shortname.toLowerCase().includes(search)) &&
        asset.value >= minPrice &&
        (maxPrice === 0 || asset.value <= maxPrice),
    )

    // Sort data
    filteredData.sort((a: Asset, b: Asset) => {
      let aValue: string | number = a[sortBy as keyof Asset] || ""
      let bValue: string | number = b[sortBy as keyof Asset] || ""

      // Handle special case for sorting by price (value)
      if (sortBy === "price") {
        aValue = a.value
        bValue = b.value
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      } else {
        return sortOrder === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue)
      }
    })

    // Limit results if specified
    if (limit) {
      filteredData = filteredData.slice(0, limit)
    }

    // Transform the data to match the expected format
    const transformedData: TransformedCrypto[] = filteredData.map((asset: Asset) => ({
      id: asset.AssetID,
      symbol: asset.shortname,
      name: asset.name,
      price: asset.value,
      change: asset.change,
      volume: asset.volume,
      marketCap: asset.marketCap,
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

