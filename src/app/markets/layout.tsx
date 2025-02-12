import type React from "react"
import Layout from "../../components/layout"

export default function MarketsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Layout>
      <div className="min-h-screen text-white">
        <main className="py-8">
          <div className="max-w-4xl p-4 mx-auto">
            <h1 className="mb-4 text-3xl font-bold">Markets</h1>
            {children}
          </div>
        </main>
      </div>
    </Layout>
  )
}

