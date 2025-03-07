"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { UserNav } from "./user-nav"
import { useEffect, useState } from "react"
import { TrendingUp, ChevronDown, Menu, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check login state on component mount
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    if (loggedIn) {
      setIsLoggedIn(true)
    } else {
      setIsLoggedIn(false)
    }
  }, [])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Navigation items
  const navItems = [
    { name: "Markets", href: "/markets" },
    { name: "Stocks", href: "/popular-stocks" },
    { name: "News", href: "/news" },
  ]

  // Conditional nav items for logged in users
  const loggedInNavItems = [{ name: "Trade", href: "/trade" }]

  return (
    <motion.header
      className={`sticky top-0 z-50 py-4 px-6 transition-all duration-300 ${
        isScrolled ? "bg-[#0d1829]/95 backdrop-blur-md shadow-lg" : " shadow-blue-500/20 transition duration-300 hover:shadow-blue-400/30"
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <nav className="relative flex items-center justify-between mx-auto max-w-7xl">
        <div className="z-20 flex items-center ">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-gradient-to-br from-blue-500 to-cyan-300"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <TrendingUp size={24} />
            </motion.div>
            <motion.span
              className="text-xl font-bold text-white"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              TradePro
            </motion.span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="z-20 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-blue-500/20"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>

        {/* Centered Desktop Navigation */}
        <div className="absolute z-10 hidden transform -translate-x-1/2 left-1/2 md:block">
          <motion.div
            className="rounded-full bg-[#1a2b4b] px-6 py-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)" }}
          >
            <ul className="flex gap-6 text-gray-300">
              {navItems.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                >
                  <Link
                    href={item.href}
                    className={`hover:text-white transition-colors relative ${
                      pathname === item.href ? "text-white" : ""
                    }`}
                  >
                    {item.name}
                    {pathname === item.href && (
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500"
                        layoutId="navbar-indicator"
                      />
                    )}
                  </Link>
                </motion.li>
              ))}

              {/* Check if user is logged in */}
              {isLoggedIn && (
                <>
                  {loggedInNavItems.map((item, index) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + 0.1 * index }}
                    >
                      <Link
                        href={item.href}
                        className={`hover:text-white transition-colors relative ${
                          pathname === item.href ? "text-white" : ""
                        }`}
                      >
                        {item.name}
                        {pathname === item.href && (
                          <motion.div
                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500"
                            layoutId="navbar-indicator"
                          />
                        )}
                      </Link>
                    </motion.li>
                  ))}
                  <motion.li
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center transition-colors hover:text-white">
                        More <ChevronDown className="w-4 h-4 ml-1" />
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.li>
                </>
              )}
            </ul>
          </motion.div>
        </div>

        {/* Auth buttons */}
        <div className="z-20 items-center hidden gap-4 md:flex">
          {isLoggedIn ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <UserNav />
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link href="/signup">
                  <Button variant="ghost" className="text-white hover:bg-[#1a2b4b] hover:text-white">
                    Sign Up
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link href="/login">
                  <Button variant="secondary" className="bg-[#1a2b4b] text-white hover:bg-[#243860]">
                    Login
                  </Button>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 right-0 bg-[#0d1829]/95 backdrop-blur-md"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 py-4">
              <ul className="flex flex-col gap-4 text-gray-300">
                {navItems.map((item, index) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link
                      href={item.href}
                      className={`block py-2 hover:text-white transition-colors ${
                        pathname === item.href ? "text-white font-medium" : ""
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.li>
                ))}

                {isLoggedIn && (
                  <>
                    {loggedInNavItems.map((item, index) => (
                      <motion.li
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + 0.1 * index }}
                      >
                        <Link
                          href={item.href}
                          className={`block py-2 hover:text-white transition-colors ${
                            pathname === item.href ? "text-white font-medium" : ""
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      </motion.li>
                    ))}
                    <motion.li
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Link
                        href="/walletscan"
                        className="block py-2 transition-colors hover:text-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Wallet Tracking
                      </Link>
                    </motion.li>
                    <motion.li
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Link
                        href="/transactiondb"
                        className="block py-2 transition-colors hover:text-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Transactions Graph
                      </Link>
                    </motion.li>
                  </>
                )}
              </ul>

              <div className="flex flex-col gap-3 mt-6">
                {isLoggedIn ? (
                  <UserNav />
                ) : (
                  <>
                    <Link href="/signup" className="w-full">
                      <Button variant="ghost" className="w-full text-white hover:bg-[#1a2b4b] hover:text-white">
                        Sign Up
                      </Button>
                    </Link>
                    <Link href="/login" className="w-full">
                      <Button variant="secondary" className="w-full bg-[#1a2b4b] text-white hover:bg-[#243860]">
                        Login
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

