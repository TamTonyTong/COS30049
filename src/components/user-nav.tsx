"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { User } from "lucide-react";
import type React from "react"; // Added import for React

export function UserNav({ children }: { children?: React.ReactNode }) {
  const router = useRouter();

  // Get user data from localStorage
  const userId = localStorage.getItem("userid") || "Guest";
  const email = localStorage.getItem("email") || "guest@example.com";

  const handleLogout = () => {
    // Implement logout logic here
    localStorage.setItem("isLoggedIn", "false");
    localStorage.setItem("userid", "");
    localStorage.setItem("email", "");
    localStorage.setItem("phone", "");
    localStorage.setItem("metawallet", "");
    console.log("Logging out...");
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <Button variant="ghost" className="relative w-8 h-8 rounded-full">
            <Avatar className="w-8 h-8">
              <AvatarImage
                src="/avatars/professional-avatar.png"
                alt="@username"
              />
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userId}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Dashboard</DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="personal-assets">Account</Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Link href="create">Create Asset</Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Link href="settings">Settings</Link>
          </DropdownMenuItem>

        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <Link href="/" onClick={handleLogout}>
            Log out
          </Link>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
