import type React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      className="h w-full rounded-md border-2 border-black bg-gray-200 px-4 py-2 font-bold text-black hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      {...props}
    >
      {children}
    </button>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={props.id}
        className="block text-sm font-bold text-gray-700"
      >
        {label}
      </label>
      <input
        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder:italic placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        {...props}
      />
    </div>
  );
}

interface FormErrorProps {
  message: string;
}

export function FormError({ message }: FormErrorProps) {
  return <p className="mt-1 text-sm text-red-500">{message}</p>;
}
