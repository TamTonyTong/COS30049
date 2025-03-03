import Layout from "@/src/components/layout"
import CryptoList from "@/src/components/crypto-list"

export default function CryptoMarketPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Cryptocurrency Market</h1>
        <p className="text-gray-400 mb-8">
          Explore the latest cryptocurrency prices, market caps, and trading volumes. Use the search and filter options
          to find specific cryptocurrencies.
        </p>
        <CryptoList />
      </div>
    </Layout>
  )
}

