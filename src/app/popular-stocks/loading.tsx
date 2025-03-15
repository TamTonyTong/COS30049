import Layout from "@/src/components/layout"

export default function Loading() {
  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    </Layout>
  )
}

