"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { User, LogOut, Settings, PlusCircle, LayoutDashboard, UserCircle, ChevronDown } from "lucide-react"
import type React from "react"
import { useState, useEffect } from "react"

export function UserNav({ children }: { children?: React.ReactNode }) {
  const router = useRouter()
  const [userId, setUserId] = useState("Guest")
  const [isOpen, setIsOpen] = useState(false)

  // Get user data from localStorage on client side
  useEffect(() => {
    setUserId(localStorage.getItem("userid") || "Guest")
  }, [])

  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false")
    localStorage.setItem("userid", "")
    localStorage.setItem("metawallet", "")
    console.log("Logging out...")
    router.push("/")
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            className="relative flex items-center gap-2 px-3 py-2 transition-all rounded-full hover:bg-[#1a2b4b] group"
          >
            <div className="relative">
              <Avatar className="w-8 h-8 border-2 border-blue-500/30 group-hover:border-blue-400 transition-colors">
                <AvatarImage src="/avatars/professional-avatar.png" alt="@username" />
                <AvatarFallback className="bg-blue-500/20 text-blue-400">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0d1829] rounded-full"></span>
            </div>
            <span className="hidden text-sm font-medium text-white md:inline-block max-w-[80px] truncate">
              {userId}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 mt-2 overflow-hidden border-blue-500/30 bg-[#1a2b4b] backdrop-blur-sm"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="px-5 py-4 font-normal bg-gradient-to-r from-blue-900/30 to-indigo-900/30">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-blue-500/50">
              <AvatarImage src="/avatars/professional-avatar.png" alt="@username" />
              <AvatarFallback className="bg-blue-500/20 text-blue-400">
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-base font-medium leading-none text-white">{userId}</p>
              <p className="text-xs text-gray-400">Trader</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <div className="p-2">
          <DropdownMenuGroup>
            <Link href="/dashboard" className="w-full">
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-blue-500/20 focus:bg-blue-500/20">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10">
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                </div>
                <span>Dashboard</span>
              </DropdownMenuItem>
            </Link>

            <Link href="/personal-assets" className="w-full">
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-blue-500/20 focus:bg-blue-500/20">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10">
                  <UserCircle className="w-4 h-4 text-blue-400" />
                </div>
                <span>Account</span>
              </DropdownMenuItem>
            </Link>

            <Link href="/create" className="w-full">
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-blue-500/20 focus:bg-blue-500/20">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10">
                  <PlusCircle className="w-4 h-4 text-blue-400" />
                </div>
                <span>Create Asset</span>
              </DropdownMenuItem>
            </Link>

            <Link href="/settings" className="w-full">
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-blue-500/20 focus:bg-blue-500/20">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10">
                  <Settings className="w-4 h-4 text-blue-400" />
                </div>
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
        </div>

        <DropdownMenuSeparator className="bg-blue-500/10" />

        <div className="p-2">
          <Link href="/" onClick={handleLogout} className="w-full">
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer text-red-400 hover:bg-red-500/10 focus:bg-red-500/10">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10">
                <LogOut className="w-4 h-4 text-red-400" />
              </div>
              <span>Log out</span>
              <span className="ml-auto text-xs text-gray-500">⇧⌘Q</span>
            </DropdownMenuItem>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

