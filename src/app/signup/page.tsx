"use client"

import { useState } from "react"
import LoginForm from "../login/login-form"
import SignUpForm from "../signup/signup-form"

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState("login")

    return (
        <div className="flex flex-col items-center min-h-screen py-10 bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-md rounded-xl">
                <h1 className="text-3xl font-bold text-center text-gray-900">Digital Asset Trading</h1>
                <div className="flex justify-center mb-8 space-x-4">
                    <button
                        onClick={() => setActiveTab("login")}
                        className={`px-6 py-2 font-semibold rounded-t-lg transition-colors ${activeTab === "login" ? "bg-black text-white" : "bg-gray-200 text-black hover:bg-gray-300"
                            }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setActiveTab("signup")}
                        className={`px-6 py-2 font-semibold rounded-t-lg transition-colors ${activeTab === "signup" ? "bg-black text-white" : "bg-gray-200 text-black hover:bg-gray-300"
                            }`}
                    >
                        Sign Up
                    </button>
                </div>
                {activeTab === "login" && <LoginForm />}
                {activeTab === "signup" && <SignUpForm />}
            </div>
        </div>
    )
}

