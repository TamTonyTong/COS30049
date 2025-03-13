"use client"

import { useEffect, useState } from "react"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/src/components/ui/command"
import { Loader2 } from "lucide-react"

interface Crypto {
  id: number
  symbol: string
  name: string
  price: number
}

interface SearchSuggestionsProps {
  searchTerm: string
  onSelect: (crypto: Crypto) => void
  isOpen: boolean
}

export function SearchSuggestions({ searchTerm, onSelect, isOpen }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Crypto[]>([])
  const [loading, setLoading] = useState(false)
  const [ethPrice, setEthPrice] = useState<number>(2500) // Default ETH price in USD

  // Fetch ETH price on component mount
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        // In a real app, you would fetch the current ETH price from an API
        // For this example, we'll use a hardcoded value
        setEthPrice(2500)
      } catch (error) {
        console.error("Error fetching ETH price:", error)
      }
    }

    fetchEthPrice()
  }, [])

  // Fetch search suggestions when search term changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/crypto?search=${encodeURIComponent(searchTerm)}&limit=5`)
        const data = await response.json()
        setSuggestions(data)
      } catch (error) {
        console.error("Error fetching suggestions:", error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  // Convert USD price to ETH
  const convertToEth = (usdPrice: number): number => {
    if (ethPrice <= 0) return 0
    return usdPrice / ethPrice
  }

  // Format ETH price with 6 decimal places
  const formatEthPrice = (ethValue: number): string => {
    return ethValue.toLocaleString(undefined, {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    })
  }

  if (!isOpen) return null

  return (
    <Command className="absolute top-full left-0 right-0 mt-2 z-50 rounded-lg border border-gray-700 bg-[#1a2b4b] shadow-lg">
      <CommandList>
        <CommandEmpty className="p-4 text-sm text-gray-400">
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </div>
          ) : (
            "No results found."
          )}
        </CommandEmpty>
        {suggestions.length > 0 && (
          <CommandGroup>
            {suggestions.map((crypto) => (
              <CommandItem
                key={crypto.id}
                onSelect={() => onSelect(crypto)}
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#243860]"
              >
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-blue-500/20">
                    <span className="text-sm font-semibold text-blue-400">{crypto.symbol.slice(0, 2)}</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">{crypto.name}</div>
                    <div className="text-sm text-gray-400">{crypto.symbol}</div>
                  </div>
                </div>
                <div className="text-right text-white">{formatEthPrice(convertToEth(crypto.price))} ETH</div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  )
}

