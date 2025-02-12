import Layout from "@/src/components/layout"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import Link from "next/link"

export default function LoginPage() {
  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8 p-6 bg-[#1a2b4b] rounded-lg shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-center text-white">Login to TradePro</h1>
        <form className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input type="email" id="email" placeholder="Enter your email" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input type="password" id="password" placeholder="Enter your password" className="mt-1" />
          </div>
          <Button type="submit" className="w-full text-white bg-blue-500 hover:bg-blue-600">
            Log In
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/forgot-password" className="text-sm text-blue-300 hover:text-blue-200">
            Forgot password?
          </Link>
        </div>
        <div className="mt-6 text-center">
          <p className="text-white">Don't have an account?</p>
          <Link href="/signup" className="text-blue-300 hover:text-blue-200">
            Sign up here
          </Link>
        </div>
      </div>
    </Layout>
  )
}

