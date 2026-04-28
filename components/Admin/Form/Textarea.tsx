import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const FormTextarea = ({ label, required, defaultValue, placeholder, ...props }: any) => {
    return (
        <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
                name='description'
                defaultValue={defaultValue}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                placeholder={placeholder}
                {...props}
            ></textarea>
        </div>
    );
};

export default FormTextarea;