import type React from "react";
import Header from "./header";
import Footer from "./footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#000919]">
      <div className="pointer-events-none absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201-t1adWwa8VhqGkCRsJ1Vfj3Ay6iVh1v.png')] bg-cover bg-fixed bg-center" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
