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

  const handleLogout = () => {
    // Implement logout logic here
    localStorage.setItem("isLoggedIn", "false");
    console.log("Logging out...");
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src="/avatars/professional-avatar.png"
                alt="@username"
              />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Alice</p>
            <p className="text-xs leading-none text-muted-foreground">
              alice@example.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Dashboard</DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="personal-assets">Personal Assets</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Orders</DropdownMenuItem>
          <DropdownMenuItem>Account</DropdownMenuItem>
          <DropdownMenuItem>History</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
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
