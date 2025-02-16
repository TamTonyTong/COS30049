import Layout from "@/src/components/layout"
import { Button } from "@/src/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto text-center text-white">
        {/* Page Heading */}
        <h1 className="mb-8 text-4xl font-bold">About TradePro</h1>

        {/* TradePro Introduction Section */}
        <div className="mb-12">
        <video
            src="/tradepro-intro.mp4"
            className="w-full mb-6 rounded-lg shadow-lg"
            autoPlay
            loop
            muted
            playsInline
          >
          </video>
          <p className="mb-4 text-lg text-justify">
            TradePro is a cutting-edge trading platform designed to empower traders of all levels. Founded in 2025, our
            mission is to democratize financial markets and provide unparalleled access to trading opportunities.
          </p>
        
        </div>

        {/* Vision & Values Section */}
        <div className="grid gap-8 mb-12">
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Our Vision</h2>
            <p className="text-justify">
              To become the world's most trusted and innovative trading platform, enabling individuals to achieve their
              financial goals through smart, accessible, and secure trading solutions.
            </p>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Our Values</h2>
            <ul className="flex flex-col items-center list-none">
              <li>Integrity in all our operations</li>
              <li>Innovation at the core of our services</li>
              <li>Empowerment of our users</li>
              <li>Transparency in our practices</li>
            </ul>
          </div>
        </div>

        {/* Group 10 Project Information Section */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Group 10 – Technology Innovation Project</h2>
          <p className="mb-4 text-lg text-justify">
            Our team, Group 10, developed TradePro as part of the <strong>Technology Innovation Project</strong> held in 
            the <strong>Spring Semester of 2025</strong>. This course provided us with an opportunity to learn about 
            <strong>blockchain technology</strong> and its applications. As part of the project, we were assigned to build 
            a <strong>responsive static website</strong> incorporating the front-end development concepts we have learned.
          </p>
          <p className="mb-4 text-lg font-semibold text-justify">
            <strong>Project Name:</strong> TradePro – A Digital Asset Trading Platform with Wallet Activities Analytics
          </p>
        </div>

        {/* Team Members Section */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Project Team Members</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-lg border border-collapse border-gray-600">
              <thead className="text-white bg-gray-800">
                <tr>
                  <th className="px-4 py-2 border border-gray-600">Name</th>
                  <th className="px-4 py-2 border border-gray-600">Student ID</th>
                  <th className="px-4 py-2 border border-gray-600">Role</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border border-gray-600">Nguyễn Quốc Bảo</td>
                  <td className="px-4 py-2 border border-gray-600">104993175</td>
                  <td className="px-4 py-2 border border-gray-600">Team Member</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-600">Trần Vũ Bảo Ngọc</td>
                  <td className="px-4 py-2 border border-gray-600">104995388</td>
                  <td className="px-4 py-2 border border-gray-600">Team Leader</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-600">Tống Đức Từ Tâm</td>
                  <td className="px-4 py-2 border border-gray-600">104775085</td>
                  <td className="px-4 py-2 border border-gray-600">Project Manager, Team Member</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-600">Nguyễn Thăng</td>
                  <td className="px-4 py-2 border border-gray-600">104974293</td>
                  <td className="px-4 py-2 border border-gray-600">Team Member</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-600">Phạm Lê Bảo Trân</td>
                  <td className="px-4 py-2 border border-gray-600">104997371</td>
                  <td className="px-4 py-2 border border-gray-600">Team Member</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Call-to-Action Section */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Join the TradePro Community</h2>
          <p className="mb-6 text-justify">
            Experience the future of trading with TradePro. Start your journey today and unlock your financial
            potential.
          </p>
          <Link href="/login">
            <Button className="px-8 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600">
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}
