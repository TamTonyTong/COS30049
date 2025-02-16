import Layout from "@/src/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto text-white">
        <h1 className="mb-8 text-4xl font-bold text-center">Privacy Policy</h1>
        <p className="mb-6 text-center">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="space-y-6">
          <Card className="bg-[#1a2b4b] border-blue-500/30">
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We collect personal information that you provide to us, such as name, email address, and financial
                information necessary for trading activities.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[rgba(10,15,30,0.8)] border-blue-500/30 shadow-lg shadow-blue-500/20 
                        hover:shadow-blue-400/30 transition duration-300 flex flex-col">
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We use your information to provide and improve our services, process transactions, and communicate with
                you about your account and our platform.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#1a2b4b] border-blue-500/30">
            <CardHeader>
              <CardTitle>3. Data Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We implement a variety of security measures to maintain the safety of your personal information when you
                enter, submit, or access your personal information.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[rgba(10,15,30,0.8)] border-blue-500/30 shadow-lg shadow-blue-500/20 
                        hover:shadow-blue-400/30 transition duration-300 flex flex-col">
            <CardHeader>
              <CardTitle>4. Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We use cookies to help us remember and process the items in your shopping cart, understand and save your
                preferences for future visits, and compile aggregate data about site traffic and site interaction.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#1a2b4b] border-blue-500/30">
            <CardHeader>
              <CardTitle>5. Third-Party Disclosure</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information
                unless we provide users with advance notice.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

