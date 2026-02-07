'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/frontend/components/auth/AuthCard';
import AuthHeader from '@/frontend/components/auth/AuthHeader';
import AuthInput from '@/frontend/components/auth/AuthInput';
import AuthButton from '@/frontend/components/auth/AuthButton';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to your Vaultix account"
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@company.com"
          required
        />

        <AuthInput
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black focus:ring-offset-0"
            />
            <span className="text-gray-600">Remember me</span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-black hover:text-gray-700 font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <AuthButton type="submit" isLoading={isLoading}>
          Sign In
        </AuthButton>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="text-black font-semibold hover:text-gray-700"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}