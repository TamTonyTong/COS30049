import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground p-4 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p>&copy; 2025 COS30049 TradePro. All rights reserved.</p>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:underline">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:underline">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}

