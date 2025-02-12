"use client"

import Layout from "@/src/components/layout"
import { useState } from "react"
import type React from "react" // Added import for React
import { Button, Input, FormError } from "../../components/ui"
import { Label } from "@/src/components/ui/label"
import Link from "next/link"


export default function LoginForm() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.email) newErrors.email = "Email is required"
        if (!formData.password) newErrors.password = "Password is required"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (validateForm()) {
            // Here you would typically send the login credentials to your backend API
            console.log("Login attempt with:", formData)
            // Simulating an API call
            await new Promise((resolve) => setTimeout(resolve, 1000))
            alert("Login successful!")
        }
    }

    return (
        <div className="w-full max-w-xs mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Email"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                {errors.email && <FormError message={errors.email} />}
                <Input
                    label="Password"
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                {errors.password && <FormError message={errors.password} />}
                <div className="mt-2 text-right">
                    <a
                        href="#"
                        className="text-sm text-blue-600 hover:underline"
                        onClick={(e) => {
                            e.preventDefault()
                            // Here you would typically handle the forgot password action
                            console.log("Forgot password clicked")
                        }}
                    >
                        Forgot Password?
                    </a>
                </div>
                <Button type="submit">Login</Button>
            </form>
        </div>
    )
}

