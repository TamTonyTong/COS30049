import type React from "react"
import Header from "./header"
import Footer from "./footer"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#000919]">
      <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201-t1adWwa8VhqGkCRsJ1Vfj3Ay6iVh1v.png')] bg-cover bg-center pointer-events-none" />
      <Header />
      <main className="flex-grow relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">{children}</div>
      </main>
      <Footer />
    </div>
  )
}

