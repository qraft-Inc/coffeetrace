 'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import HeroBackground from '../../../components/HeroBackground';
import { Coffee, Eye, EyeOff, ArrowLeft } from 'lucide-react';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting sign in with email:', email);
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('Sign in result:', result);

      if (result?.error) {
        console.error('Sign in error:', result.error);
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result?.ok) {
        console.log('Sign in successful, redirecting...');
        // Successful sign in - redirect to dashboard
        const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
        window.location.href = callbackUrl;
      } else {
        console.error('Sign in failed with no error message');
        setError('Sign in failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Sign in exception:', err);
      setError('An unexpected error occurred: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white dark:bg-gray-900">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Back Button */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-coffee-600 dark:text-gray-400 hover:text-coffee-800 dark:hover:text-gray-200 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back Home</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-coffee-900 dark:text-gray-100 mb-2">Sign In</h1>
            <p className="text-coffee-600 dark:text-gray-400">Enter your email and password to sign in!</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Social Sign In Button (Google only) */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium text-coffee-700">Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-coffee-500 dark:text-gray-400">Or</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-coffee-900 dark:text-gray-200 mb-2">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-coffee-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="info@gmail.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-coffee-900 dark:text-gray-200 mb-2">
                Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-coffee-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-coffee-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-800"
                />
                <span className="ml-2 text-sm text-coffee-700 dark:text-gray-300">Keep me logged in</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-coffee-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Brand Panel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        {/* Video background (bkg2) with poster fallback */}
        <HeroBackground src="/backgrounds/bkg2.mp4" poster="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920&h=1080&fit=crop" />

        {/* Content (overlay on top of video) */}
        <div className="relative flex flex-col items-center justify-center w-full px-12 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-sm mb-6">
              <Coffee className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Coffee Trace</h2>
            <p className="text-coffee-100 text-lg max-w-md">
              Free and Open-Source Coffee Traceability Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
