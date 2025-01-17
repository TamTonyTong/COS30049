import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">CryptoTrade</Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link href="/trading" className="hover:text-primary">Trading</Link></li>
            <li><Link href="/wallet" className="hover:text-primary">Wallet</Link></li>
            <li><Button variant="outline">Sign In</Button></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}