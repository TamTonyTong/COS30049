import "./globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import type React from "react" // Import React

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TradePro - Trading Platform",
  description: "Discover endless possibilities in the world of Trading",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

