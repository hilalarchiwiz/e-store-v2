// components/global/FormInput.tsx
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const FormInput: React.FC<InputProps> = ({ label, required, ...props }) => {
    return (
        <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                {...props}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 transition-colors"
            />
        </div>
    );
};

export default FormInput;