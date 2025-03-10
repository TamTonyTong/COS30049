"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { UserNav } from "./user-nav";
import { useEffect, useState } from "react";
import { TrendingUp, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check login state on component mount
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (loggedIn) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <header className="bg-[#0d1829]/80 px-6 py-4 backdrop-blur-sm">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-300 text-white">
            <TrendingUp size={24} />
          </div>
          <span className="text-xl font-bold text-white">TradePro</span>
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 transform">
          <div className="rounded-full bg-[#1a2b4b] px-6 py-2">
            <ul className="flex gap-6 text-gray-300">
              <li>
                <Link
                  href="/markets"
                  className="transition-colors hover:text-white"
                >
                  Markets
                </Link>
              </li>
              <li>
                <Link
                  href="/popular-stocks"
                  className="transition-colors hover:text-white"
                >
                  Stocks
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="transition-colors hover:text-white"
                >
                  News
                </Link>
              </li>

              {/* Check if user is logged in */}
              {isLoggedIn && (
                <>
                  <li>
                    <Link
                      href="/trade"
                      className="transition-colors hover:text-white"
                    >
                      Trade
                    </Link>
                  </li>
                  <li>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center transition-colors hover:text-white">
                        More <ChevronDown className="ml-1 h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Link href="/walletscan" className="w-full">
                            Wallet Tracking
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/transactiondb" className="w-full">
                            Transactions Graph
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/transaction_explorer" className="w-full">
                            Transactions Graph Real
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <UserNav />
          ) : (
            <>
              <Link href="/signup">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-[#1a2b4b] hover:text-white"
                >
                  Sign Up
                </Button>
              </Link>

              <Link href="/login">
                <Button
                  variant="secondary"
                  className="bg-[#1a2b4b] text-white hover:bg-[#243860]"
                >
                  Login
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
