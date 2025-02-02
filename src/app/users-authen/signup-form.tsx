"use client"

import { useState } from "react"
import { Button, Input, FormError } from "./components/ui"

export default function SignUpForm() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.username) newErrors.username = "Username is required"
        if (!formData.email) newErrors.email = "Email is required"
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
        if (!formData.password) newErrors.password = "Password is required"
        else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (validateForm()) {
            // Here you would typically send the form data to your backend API
            console.log("Sign-up attempt with:", formData)
            // Simulating an API call
            await new Promise((resolve) => setTimeout(resolve, 1000))
            alert("Sign up successful! Please check your email to verify your account.")
        }
    }

    return (
        <div className="w-full max-w-xs mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Username"
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                {errors.username && <FormError message={errors.username} />}
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
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                {errors.password && <FormError message={errors.password} />}
                <Input
                    label="Confirm Password"
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
                {errors.confirmPassword && <FormError message={errors.confirmPassword} />}
                <Button type="submit">Sign Up</Button>
            </form>
        </div>
    )
}

