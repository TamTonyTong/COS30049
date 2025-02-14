import { NextResponse } from "next/server"

const stocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: 150.25, change: 2.5 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 2750.8, change: -0.3 },
  { symbol: "MSFT", name: "Microsoft Corporation", price: 305.15, change: 1.2 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 3380.5, change: -1.5 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 750.3, change: 3.8 },
]

export async function GET() {
  return NextResponse.json(stocks)
}

