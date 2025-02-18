import Layout from "@/src/components/layout";
import { Button } from "@/src/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl text-center text-white">
        {/* Page Heading */}
        <h1 className="mb-8 text-4xl font-bold">About TradePro</h1>

        {/* TradePro Introduction Section */}
        <div className="mb-12">
          <video
            src="/tradepro-intro.mp4"
            className="mb-6 w-full rounded-lg shadow-lg"
            autoPlay
            loop
            muted
            playsInline
          ></video>
          <p className="mb-4 text-justify text-lg">
            TradePro is a cutting-edge trading platform designed to empower
            traders of all levels. Founded in 2025, our mission is to
            democratize financial markets and provide unparalleled access to
            trading opportunities.
          </p>
        </div>

        {/* Vision & Values Section */}
        <div className="mb-12 grid gap-8">
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Our Vision</h2>
            <p className="text-justify">
              To become the world's most trusted and innovative trading
              platform, enabling individuals to achieve their financial goals
              through smart, accessible, and secure trading solutions.
            </p>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Our Values</h2>
            <ul className="flex list-none flex-col items-center">
              <li>Integrity in all our operations</li>
              <li>Innovation at the core of our services</li>
              <li>Empowerment of our users</li>
              <li>Transparency in our practices</li>
            </ul>
          </div>
        </div>

        {/* Group 10 Project Information Section */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">
            Group 10 – Technology Innovation Project
          </h2>
          <p className="mb-4 text-justify text-lg">
            Our team, Group 10, developed TradePro as part of the{" "}
            <strong>Technology Innovation Project</strong> held in the{" "}
            <strong>Spring Semester of 2025</strong>. This course provided us
            with an opportunity to learn about
            <strong>blockchain technology</strong> and its applications. As part
            of the project, we were assigned to build a{" "}
            <strong>responsive static website</strong> incorporating the
            front-end development concepts we have learned.
          </p>
          <p className="mb-4 text-justify text-lg font-semibold">
            <strong>Project Name:</strong> TradePro – A Digital Asset Trading
            Platform with Wallet Activities Analytics
          </p>
        </div>

        {/* Team Members Section */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Project Team Members</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-600 text-lg">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="border border-gray-600 px-4 py-2">Name</th>
                  <th className="border border-gray-600 px-4 py-2">
                    Student ID
                  </th>
                  <th className="border border-gray-600 px-4 py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-600 px-4 py-2">
                    Nguyễn Quốc Bảo
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    104993175
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    Team Member
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-600 px-4 py-2">
                    Trần Vũ Bảo Ngọc
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    104995388
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    Team Leader
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-600 px-4 py-2">
                    Tống Đức Từ Tâm
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    104775085
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    Project Manager, Team Member
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-600 px-4 py-2">
                    Nguyễn Thăng
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    104974293
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    Team Member
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-600 px-4 py-2">
                    Phạm Lê Bảo Trân
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    104997371
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    Team Member
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Call-to-Action Section */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">
            Join the TradePro Community
          </h2>
          <p className="mb-6 text-justify">
            Experience the future of trading with TradePro. Start your journey
            today and unlock your financial potential.
          </p>
          <Link href="/login">
            <Button className="rounded-full bg-blue-500 px-8 py-2 text-white hover:bg-blue-600">
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
