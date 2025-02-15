"use client"

import { useState } from "react"
import type React from "react" // Added import for React
import { Button, Input, FormError } from "../../components/ui"
import { useRouter } from "next/navigation"; // Import useRouter

export default function LoginForm() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const router = useRouter(); // Initialize useRouter

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
            try {
                const response = await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Login successful:", data);
                    router.push("/personal-assets"); // Redirect to personal-assets page
                } else {
                    const errorData = await response.json();
                    setErrors({ general: errorData.message });
                }
            } catch (error) {
                setErrors({ general: "An unexpected error occurred. Please try again." });
            }
        }
    }

    return (
        <div className="w-full max-w-xs mx-auto text-black">
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

