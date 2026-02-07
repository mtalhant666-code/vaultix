import React from 'react';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  pills?: string[];
}

export default function AuthHeader({ title, subtitle, pills }: AuthHeaderProps) {
  return (
    <div className="mb-8">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-11 h-11 bg-black rounded-lg flex items-center justify-center shadow-md">
          <span className="text-white text-2xl font-bold">V</span>
        </div>
        <span className="text-2xl font-semibold tracking-tight text-gray-900">Vaultix</span>
      </div>

      {/* Title & Subtitle */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2">
        {title}
      </h1>
      <p className="text-gray-500 text-base leading-relaxed mb-2">
        {subtitle}
      </p>

      {/* Feature Pills */}
      {pills && pills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {pills.map((pill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200"
            >
              {pill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}