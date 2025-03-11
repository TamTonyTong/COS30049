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

  if (!isOpen) return null

  return (
    <Command className="absolute top-full left-0 right-0 mt-2 z-50 rounded-lg border border-gray-700 bg-[#1a2b4b] shadow-lg">
      <CommandList>
        <CommandEmpty className="p-4 text-sm text-gray-400">
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                    <span className="text-blue-400 font-semibold text-sm">{crypto.symbol.slice(0, 2)}</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">{crypto.name}</div>
                    <div className="text-sm text-gray-400">{crypto.symbol}</div>
                  </div>
                </div>
                <div className="text-right text-white">
                  ${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  )
}

