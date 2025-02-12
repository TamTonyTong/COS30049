import Layout from "@/src/components/layout"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"

export default function ContactPage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto text-white">
        <h1 className="mb-8 text-4xl font-bold text-center">Contact Us</h1>
        <p className="mb-6 text-center">
          Have questions or concerns? We're here to help. Fill out the form below and we'll get back to you as soon as
          possible.
        </p>
        <form className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={5} className="mt-1" />
          </div>
          <Button type="submit" className="w-full text-white bg-blue-500 hover:bg-blue-600">
            Send Message
          </Button>
        </form>
        <div className="mt-12 text-center">
          <h2 className="mb-4 text-2xl font-semibold">Other Ways to Reach Us</h2>
          <p className="mb-2">Email: support@tradepro.com</p>
          <p className="mb-2">Phone: +84 333 373472</p>
          <p>Address: A35 Bach Dang Street, Tan Binh District, HCM, VN 90000</p>
        </div>
      </div>
    </Layout>
  )
}

