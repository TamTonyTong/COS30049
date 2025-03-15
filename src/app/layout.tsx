import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import type React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TradePro - Trading Platform",
  description: "Discover endless possibilities in the world of Trading",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  console.log("Inter class name:", inter.className); // Log the class name for debugging

  return (
    <html lang="en" className="h-full dark">
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  );
}