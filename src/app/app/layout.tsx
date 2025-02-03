import "./globals.css"
import { Inter } from "next/font/google"
import Header from "./components/header"
import Footer from "./components/footer"
import type { Metadata } from "next"
import type React from "react" // Added import for React

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
      <body className={`${inter.className} min-h-screen bg-[#000919] relative overflow-x-hidden flex flex-col`}>
        <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201-t1adWwa8VhqGkCRsJ1Vfj3Ay6iVh1v.png')] bg-cover bg-center pointer-events-none" />
        <div className="relative flex-grow">
          <Header />
          <main>{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  )
}

