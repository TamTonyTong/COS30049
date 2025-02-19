import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-8 bg-muted p-4 text-muted-foreground">
      <div className="container mx-auto flex flex-col items-center justify-between md:flex-row">
        <div className="mb-4 md:mb-0">
          <p>&copy; COS30049 2025 TradePro. All rights reserved.</p>
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
  );
}
