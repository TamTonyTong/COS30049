import type React from "react"
import Header from "./header"
import Footer from "./footer"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#000919] relative">
      <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201-t1adWwa8VhqGkCRsJ1Vfj3Ay6iVh1v.png')] bg-cover bg-center bg-fixed pointer-events-none" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  )
}

