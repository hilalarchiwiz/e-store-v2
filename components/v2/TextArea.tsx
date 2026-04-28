import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  icon?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, error, icon, className = '', id, ...props }) => {
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
          <span className="material-symbols-outlined absolute left-4 top-5 text-gray-400 group-focus-within:text-primary transition-colors">
            {icon}
          </span>
        )}
        <textarea
          id={id}
          className={`
            w-full bg-background-light dark:bg-white/5 
            border border-gray-200 dark:border-white/10 
            rounded-xl py-3 px-4 
            ${icon ? 'pl-11' : ''}
            text-sm placeholder:text-gray-400 dark:text-white
            outline-none transition-all
            focus:border-primary focus:ring-2 focus:ring-primary/20
            disabled:opacity-50
            min-h-[120px] resize-none
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
};

export default TextArea;

