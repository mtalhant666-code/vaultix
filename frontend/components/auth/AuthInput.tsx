import React from 'react';

interface AuthInputProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
}

export default function AuthInput({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  helperText,
  error,
}: AuthInputProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-900"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`
          w-full px-4 py-2.5 
          text-sm text-gray-900 
          bg-white border rounded-lg 
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0
          placeholder:text-gray-400
          ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-black focus:ring-black'
          }
        `}
      />
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}