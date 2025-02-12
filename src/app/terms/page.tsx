import Layout from "@/src/components/layout"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion"

export default function TermsPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto text-white">
        <h1 className="mb-8 text-4xl font-bold text-center">Terms of Service</h1>
        <p className="mb-6 text-center">Last updated: {new Date().toLocaleDateString()}</p>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>1. Acceptance of Terms</AccordionTrigger>
            <AccordionContent>
              By accessing or using the TradePro platform, you agree to be bound by these Terms of Service. If you do
              not agree to all the terms and conditions, you must not use our services.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>2. Description of Service</AccordionTrigger>
            <AccordionContent>
              TradePro provides a platform for online trading of various financial instruments. We do not provide
              financial advice, and all trading decisions are made solely by the user.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>3. User Responsibilities</AccordionTrigger>
            <AccordionContent>
              Users are responsible for maintaining the confidentiality of their account information, including
              passwords. All activities that occur under your account are your responsibility.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>4. Prohibited Activities</AccordionTrigger>
            <AccordionContent>
              Users must not engage in any illegal activities, market manipulation, or any action that could disrupt the
              platform or other users' experiences.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>5. Termination of Service</AccordionTrigger>
            <AccordionContent>
              TradePro reserves the right to terminate or suspend access to our services immediately, without prior
              notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Layout>
  )
}

