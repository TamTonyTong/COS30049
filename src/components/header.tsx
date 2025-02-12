"use client"

import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { UserNav } from "./user-nav"
import { useState } from "react"
import { TrendingUp, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu"

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  return (
    <header className="py-4 px-6 bg-[#0d1829]/80 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-300 rounded-lg flex items-center justify-center text-white">
            <TrendingUp size={24} />
          </div>
          <span className="text-white font-bold text-xl">TradePro</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <div className="bg-[#1a2b4b] rounded-full px-6 py-2">
            <ul className="flex gap-6 text-gray-300">
              <li>
                <Link href="/personal_assets" className="hover:text-white transition-colors">
                  Personal Assets
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-white transition-colors">
                  Markets
                </Link>
              </li>
              <li>
                <Link href="/user_public_info" className="hover:text-white transition-colors">
                  User's Public Info
                </Link>
              </li>
              <li>
                <Link href="/trade" className="hover:text-white transition-colors">
                  Trading
                </Link>
              </li>
              <li>
                <Link href="/walletscan" className="hover:text-white transition-colors">
                  Scan Wallet
                </Link>
              </li>
              <li>
                <Link href="/transactiondb" className="hover:text-white transition-colors">
                  Transactions
                </Link>
              </li>
              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center hover:text-white transition-colors">
                    Assets <ChevronDown className="ml-1 h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Link href="/available" className="w-full">
                      Featured Assets
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/personal_assets" className="w-full">
                      Personal Assets
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/trade-wallet" className="w-full">
                        Trade Wallet
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <UserNav />
          ) : (
            <>
              <Button variant="ghost" className="text-white hover:text-white hover:bg-[#1a2b4b]">
                Sign Up
              </Button>
              <Button variant="secondary" className="bg-[#1a2b4b] text-white hover:bg-[#243860]" onClick={handleLogin}>
                Login
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

