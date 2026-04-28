"use client";

import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
  showToggle?: boolean;
}

const Input: React.FC<InputProps> = ({ label, error, icon, showToggle, className = '', id, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showToggle && type === 'password'
    ? (showPassword ? 'text' : 'password')
    : type;

  return (
    <div className="w-full space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-bold text-[#121714] dark:text-white"
        >
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={inputType}
          className={`
            w-full bg-background-light dark:bg-white/5
            border border-gray-200 dark:border-white/10
            rounded-xl py-3 px-4
            ${icon ? 'pl-11' : ''}
            ${showToggle ? 'pr-11' : ''}
            text-sm placeholder:text-gray-400 dark:text-white
            outline-none transition-all
            focus:border-primary focus:ring-2 focus:ring-primary/20
            disabled:opacity-50
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
        {showToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Input;
