import type React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
}

export function Button({ children, ...props }: ButtonProps) {
    return (
        <button
            className="w-full px-4 py-2 font-bold bg-gray-200 text-black rounded-md border-black border-2
                 hover:bg-black hover:text-white h
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            {...props}
        >
            {children}
        </button>
    )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
}

export function Input({ label, ...props }: InputProps) {
    return (
        <div className="space-y-2">
            <label htmlFor={props.id} className="block text-sm font-bold text-gray-700">
                {label}
            </label>
            <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                   focus:outline-none focus:ring-blue-500 focus:border-blue-500
                   placeholder:italic placeholder:text-gray-400"
                {...props}
            />
        </div>
    )
}

interface FormErrorProps {
    message: string
}

export function FormError({ message }: FormErrorProps) {
    return <p className="text-red-500 text-sm mt-1">{message}</p>
}

