'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Coffee, User, Building2, Users, TrendingUp, Eye, EyeOff } from 'lucide-react';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'farmer';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
    phone: '',
    companyName: '',
    businessType: 'roaster',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: choose role, 1: fill details
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone,
          ...(formData.role === 'buyer' && {
            companyName: formData.companyName,
            businessType: formData.businessType,
          }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      // Auto sign in and redirect to dashboard
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // If auto-signin fails, redirect to signin page
        router.push('/auth/signin?message=Account created successfully');
      } else {
        // Success - redirect to dashboard
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8 lg:px-20 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {step === 0 && (
            <div className="mb-8">
              <Link href="/" className="text-coffee-500 hover:text-coffee-700 inline-flex items-center gap-2 text-sm font-medium transition-colors">
                <span className="text-lg">←</span>
                <span>Back Home</span>
              </Link>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-coffee-900 mb-2">
              {step === 0 ? 'Select your role' : `Join as ${formData.role === 'farmer' ? 'Farmer' : formData.role === 'buyer' ? 'Buyer' : formData.role === 'coopAdmin' ? 'Cooperative' : 'Investor'}`}
            </h1>
            <p className="text-coffee-600 text-sm">
              {step === 0 ? 'Choose the role that best describes you' : 'Enter your details to get started'}
            </p>
          </div>

          {/* Form (no card) */}
          <div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Step 0: Role selection */}
          {step === 0 && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'farmer' })}
                  aria-pressed={formData.role === 'farmer'}
                  className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all hover:shadow-md ${
                    formData.role === 'farmer'
                      ? 'border-green-500 bg-green-50 shadow-sm'
                      : 'border-coffee-200 bg-white hover:border-coffee-300'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                    <Coffee className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-base font-semibold text-coffee-900">Farmer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'buyer' })}
                  aria-pressed={formData.role === 'buyer'}
                  className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all hover:shadow-md ${
                    formData.role === 'buyer'
                      ? 'border-orange-500 bg-orange-50 shadow-sm'
                      : 'border-coffee-200 bg-white hover:border-coffee-300'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-base font-semibold text-coffee-900">Buyer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'coopAdmin' })}
                  aria-pressed={formData.role === 'coopAdmin'}
                  className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all hover:shadow-md ${
                    formData.role === 'coopAdmin'
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-coffee-200 bg-white hover:border-coffee-300'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-base font-semibold text-coffee-900">Cooperative</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'investor' })}
                  aria-pressed={formData.role === 'investor'}
                  className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all hover:shadow-md ${
                    formData.role === 'investor'
                      ? 'border-purple-500 bg-purple-50 shadow-sm'
                      : 'border-coffee-200 bg-white hover:border-coffee-300'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-base font-semibold text-coffee-900">Investor</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold shadow-sm hover:shadow-md"
              >
                Continue
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-coffee-600">
                  Already have an account?{' '}
                  <Link href="/auth/signin" className="text-green-600 hover:text-green-700 font-semibold">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Details form */}
          {step === 1 && (
            <>
              {/* Google button */}
              <div className="mb-5">
                <button type="button" className="w-full py-3 bg-white border border-coffee-300 rounded-lg flex items-center justify-center gap-3 hover:bg-coffee-50 transition-colors" aria-label="Sign up with Google">
                  <svg className="h-5 w-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                  <span className="text-sm font-medium text-coffee-700">Google</span>
                </button>
              </div>
              <div className="flex items-center gap-3 mb-5">
                <hr className="flex-1 border-coffee-200" />
                <span className="text-coffee-500 text-xs uppercase tracking-wider">Or</span>
                <hr className="flex-1 border-coffee-200" />
              </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-coffee-900 mb-2">Full Name<span className="text-red-500">*</span></label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-coffee-300 rounded-lg bg-white text-coffee-900 placeholder:text-coffee-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              {formData.role === 'buyer' && (
                <>
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-coffee-900 mb-2">Company Name<span className="text-red-500">*</span></label>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-coffee-300 rounded-lg bg-white text-coffee-900 placeholder:text-coffee-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="businessType" className="block text-sm font-medium text-coffee-900 mb-2">Business Type</label>
                    <select
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="roaster">Roaster</option>
                      <option value="exporter">Exporter</option>
                      <option value="trader">Trader</option>
                      <option value="retailer">Retailer</option>
                      <option value="cafe">Cafe</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-coffee-900 mb-2">Email Address<span className="text-red-500">*</span></label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-coffee-300 rounded-lg bg-white text-coffee-900 placeholder:text-coffee-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-coffee-900 mb-2">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-coffee-300 rounded-lg bg-white text-coffee-900 placeholder:text-coffee-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-coffee-900 mb-2">Password<span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 pr-11 border border-coffee-300 rounded-lg bg-white text-coffee-900 placeholder:text-coffee-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-500 hover:text-coffee-700 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-coffee-900 mb-2">Confirm Password<span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 pr-11 border border-coffee-300 rounded-lg bg-white text-coffee-900 placeholder:text-coffee-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-500 hover:text-coffee-700 transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="px-4 py-2 text-coffee-700 hover:text-coffee-900 font-medium transition-colors inline-flex items-center gap-2"
                >
                  <span className="text-lg">←</span>
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="py-2.5 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>
            </>
          )}
        </div>
        </div>
      </div>

      {/* Right: Video panel */}
      <div className="hidden md:block md:w-1/2 relative min-h-screen">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/backgrounds/bkg2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-12">
          <div className="mb-4 p-3 rounded-lg bg-white/10 inline-flex items-center justify-center">
            <Coffee className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            <span className="text-white">Coffee</span>
            <span className="text-white"> Trace</span>
          </h2>
          <p className="text-white/90 text-lg max-w-md">
            From Farm to Cup,
          
            Every Bean Traced
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
