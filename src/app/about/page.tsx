import Layout from "@/src/components/layout"
import { Button } from "@/src/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto text-center white text-j">
        <h1 className="mb-8 text-4xl font-bold">About TradePro</h1>

        <div className="mb-12">
          <Image
            src="/aboutus.jpg?height=300&width=800"
            alt="TradePro Team"
            width={800}
            height={300}
            className="w-full mb-6 rounded-lg shadow-lg"
          />
          <p className="mb-4 text-lg">
            TradePro is a cutting-edge trading platform designed to empower traders of all levels. Founded in 2023, our
            mission is to democratize financial markets and provide unparalleled access to trading opportunities.
          </p>
          <p className="mb-4 text-lg">
            Our team of experienced traders, financial experts, and tech innovators work tirelessly to deliver a
            seamless trading experience. We combine advanced technology with user-friendly interfaces to make trading
            accessible, efficient, and secure.
          </p>
        </div>

        <div className="grid gap-8 mb-12">
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Our Vision</h2>
            <p>
              To become the world's most trusted and innovative trading platform, enabling individuals to achieve their
              financial goals through smart, accessible, and secure trading solutions.
            </p>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Our Values</h2>
            <ul className="list-none">
              <li>Integrity in all our operations</li>
              <li>Innovation at the core of our services</li>
              <li>Empowerment of our users</li>
              <li>Transparency in our practices</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-semibold">Join the TradePro Community</h2>
          <p className="mb-6">
            Experience the future of trading with TradePro. Start your journey today and unlock your financial
            potential.
          </p>
          <Link href="/login">
            <Button className="px-8 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600">Get Started Now</Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

