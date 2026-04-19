'use client';

import { useState, Suspense, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Coffee, Leaf, Users, ShoppingBag, TrendingUp, Eye, EyeOff } from 'lucide-react';

const VALID_MODES = ['signup', 'signin'];
const VALID_ROLES = ['farmer', 'cooperative', 'buyer', 'investor'];
const ROLE_API_MAP = {
  farmer: 'farmer',
  cooperative: 'coopAdmin',
  buyer: 'buyer',
  investor: 'investor',
};

const ROLE_CONFIG = {
  farmer: {
    label: 'Farmer',
    icon: Leaf,
    color: 'primary',
    description: 'Sell coffee with verified origin',
  },
  cooperative: {
    label: 'Cooperative',
    icon: Users,
    color: 'emerald',
    description: 'Aggregate and export coffee',
  },
  buyer: {
    label: 'Buyer',
    icon: ShoppingBag,
    color: 'blue',
    description: 'Source specialty coffee',
  },
  investor: {
    label: 'Investor',
    icon: TrendingUp,
    color: 'indigo',
    description: 'Support sustainable coffee',
  },
};

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read and validate query params
  const rawMode = searchParams.get('mode') || 'signup';
  const rawRole = searchParams.get('role') || null;

  const mode = VALID_MODES.includes(rawMode) ? rawMode : 'signup';
  const initialRole = VALID_ROLES.includes(rawRole) ? rawRole : null;

  // State
  const [currentMode, setCurrentMode] = useState(mode);
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [signupStep, setSignupStep] = useState(initialRole ? 2 : 1); // 1: role selection, 2: form
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sign Up State
  const [signUpForm, setSignUpForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
    businessType: 'roaster',
  });

  // Sign In State
  const [signInForm, setSignInForm] = useState({
    email: '',
    password: '',
  });

  // Update URL when mode or role changes
  const updateUrl = (newMode, newRole) => {
    const params = new URLSearchParams();
    params.set('mode', newMode);
    if (newRole) params.set('role', newRole);
    router.replace(`/auth?${params.toString()}`);
  };

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
    setSignupStep(1);
    setSelectedRole(null);
    setError('');
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setSignupStep(2);
    updateUrl('signup', role);
    setError('');
  };

  const handleBackToRoles = () => {
    setSignupStep(1);
    setSelectedRole(null);
  };

  const handleSignUpChange = (e) => {
    setSignUpForm({
      ...signUpForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignInChange = (e) => {
    setSignInForm({
      ...signInForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    if (signUpForm.password !== signUpForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signUpForm.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const apiRole = ROLE_API_MAP[selectedRole];
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signUpForm.name,
          email: signUpForm.email,
          password: signUpForm.password,
          role: apiRole,
          phone: signUpForm.phone,
          ...(selectedRole === 'buyer' && {
            companyName: signUpForm.companyName,
            businessType: signUpForm.businessType,
          }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      // Auto sign in
      const signInResult = await signIn('credentials', {
        email: signUpForm.email,
        password: signUpForm.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push('/auth/signin?message=Account created successfully');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: signInForm.email,
        password: signInForm.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    return ROLE_CONFIG[role]?.label || role;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row scroll-smooth">
      {/* Left: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8 lg:px-20 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md animate-fadeIn">
          {/* Back button - Show for signup form or signin */}
          <div className="mb-8">
            {currentMode === 'signup' && signupStep === 2 ? (
              <button 
                onClick={handleBackToRoles}
                className="text-coffee-500 hover:text-coffee-700 inline-flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <span className="text-lg">←</span>
                <span>Back</span>
              </button>
            ) : (
              <Link href="/" className="text-coffee-500 hover:text-coffee-700 inline-flex items-center gap-2 text-sm font-medium transition-colors">
                <span className="text-lg">←</span>
                <span>Back Home</span>
              </Link>
            )}
          </div>

          {/* Logo and Title */}
          {currentMode === 'signup' && signupStep === 1 ? (
            // Step 1: Role Selection
            <>
              <div className="mb-12">
                <h1 className="text-4xl font-bold text-coffee-900 mb-4 text-center">
                  Choose Your Path
                </h1>
                <p className="text-center text-coffee-700">
                  Whether you're growing, aggregating, buying, or investing—Coffee Trace<br />
                  connects you to opportunities
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Role Selection Grid - 4 columns */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Investor Card */}
                <div className="flex flex-col items-center gap-4 p-6 rounded-lg border-2 border-coffee-300 hover:border-coffee-400 transition-all bg-white animate-slideInUp animate-stagger-1">
                  <div className="p-4 rounded-lg bg-indigo-100">
                    <TrendingUp className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-coffee-900 mb-2">For Investors</h3>
                    <p className="text-sm text-coffee-600 mb-4">
                      Support sustainable coffee and track impact returns
                    </p>
                  </div>
                  <button
                    onClick={() => handleRoleSelect('investor')}
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm hover:scale-105 transform"
                  >
                    Learn More
                  </button>
                </div>

                {/* Farmer Card */}
                <div className="flex flex-col items-center gap-4 p-6 rounded-lg border-2 border-coffee-300 hover:border-coffee-400 transition-all bg-white animate-slideInUp animate-stagger-2">
                  <div className="p-4 rounded-lg bg-emerald-100">
                    <Leaf className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-coffee-900 mb-2">For Farmers</h3>
                    <p className="text-sm text-coffee-600 mb-4">
                      Sell lots with verified origin and earn premium prices
                    </p>
                  </div>
                  <button
                    onClick={() => handleRoleSelect('farmer')}
                    className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm hover:scale-105 transform"
                  >
                    Get Started
                  </button>
                </div>

                {/* Cooperative Card */}
                <div className="flex flex-col items-center gap-4 p-6 rounded-lg border-2 border-coffee-300 hover:border-coffee-400 transition-all bg-white animate-slideInUp animate-stagger-3">
                  <div className="p-4 rounded-lg bg-emerald-100">
                    <Users className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-coffee-900 mb-2">For Cooperatives</h3>
                    <p className="text-sm text-coffee-600 mb-4">
                      Aggregate, track, and export coffee with compliance proof
                    </p>
                  </div>
                  <button
                    onClick={() => handleRoleSelect('cooperative')}
                    className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm hover:scale-105 transform"
                  >
                    Get Started
                  </button>
                </div>

                {/* Buyer Card */}
                <div className="flex flex-col items-center gap-4 p-6 rounded-lg border-2 border-coffee-300 hover:border-coffee-400 transition-all bg-white animate-slideInUp animate-stagger-4">
                  <div className="p-4 rounded-lg bg-blue-100">
                    <ShoppingBag className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-coffee-900 mb-2">For Buyers</h3>
                    <p className="text-sm text-coffee-600 mb-4">
                      Source specialty coffee with verified quality and origin
                    </p>
                  </div>
                  <button
                    onClick={() => handleRoleSelect('buyer')}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm hover:scale-105 transform"
                  >
                    Browse Lots
                  </button>
                </div>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-sm text-coffee-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => handleModeChange('signin')}
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </>
          ) : currentMode === 'signup' && signupStep === 2 ? (
            // Step 2: Signup Form
            <>
              <div className="mb-8">
                <div className="mb-6">
                  <img 
                    src="https://res.cloudinary.com/ddew8kfxf/image/upload/v1763059666/Coffee_Trap_Mix_ky8mwv.png" 
                    alt="Coffee Trace Logo" 
                    className="h-16 w-auto"
                  />
                </div>
                <h1 className="text-3xl font-bold text-coffee-900 mb-2">
                  Join as {getRoleLabel(selectedRole)}
                </h1>
                <p className="text-coffee-600 text-sm">
                  Enter your details to get started
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-coffee-900 mb-2">
                    Full Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={signUpForm.name}
                    onChange={handleSignUpChange}
                    required
                    className="w-full px-4 py-2.5 border border-coffee-300 rounded-lg bg-white text-coffee-900 placeholder:text-coffee-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-coffee-900 mb-2">
                    Email Address<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={signUpForm.email}
                    onChange={handleSignUpChange}
                    required
                    className="w-full px-4 py-2.5 border border-coffee-300 rounded-lg bg-white text-coffee-900 placeholder:text-coffee-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="info@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-coffee-900 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={signUpForm.phone}
                    onChange={handleSignUpChange}
                    className="w-full px-4 py-2.5 border border-coffee-300 rounded-lg bg-white text-coffee-900 placeholder:text-coffee-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="+256 700 123456"
                  />
                </div>

                {selectedRole === 'buyer' && (
                  <>
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-coffee-900 mb-2">
                        Company Name
                      </label>
                      <input
                        id="companyName"
                        type="text"
                        name="companyName"
                        value={signUpForm.companyName}
                        onChange={handleSignUpChange}
                        className="w-full px-4 py-2.5 border border-coffee-300 rounded-lg bg-white text-coffee-900 placeholder:text-coffee-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Your Company"
                      />
                    </div>

                    <div>
                      <label htmlFor="businessType" className="block text-sm font-medium text-coffee-900 mb-2">
                        Business Type
                      </label>
                      <select
                        id="businessType"
                        name="businessType"
                        value={signUpForm.businessType}
                        onChange={handleSignUpChange}
                        className="w-full px-4 py-2.5 border border-coffee-300 rounded-lg bg-white text-coffee-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      >
                        <option value="roaster">Roaster</option>
                        <option value="importer">Importer</option>
                        <option value="cafe">Café</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-coffee-900 mb-2">
                    Password<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={signUpForm.password}
                      onChange={handleSignUpChange}
                      required
                      className="w-full px-4 py-2.5 pr-11 border border-coffee-300 rounded-lg bg-white text-coffee-900 placeholder:text-coffee-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="Min 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-500 hover:text-coffee-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-coffee-900 mb-2">
                    Confirm Password<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={signUpForm.confirmPassword}
                      onChange={handleSignUpChange}
                      required
                      className="w-full px-4 py-2.5 pr-11 border border-coffee-300 rounded-lg bg-white text-coffee-900 placeholder:text-coffee-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-500 hover:text-coffee-700 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            </>
          ) : (
            // Sign In
            <>
              <div className="mb-8">
                <div className="mb-6">
                  <img 
                    src="https://res.cloudinary.com/ddew8kfxf/image/upload/v1763059666/Coffee_Trap_Mix_ky8mwv.png" 
                    alt="Coffee Trace Logo" 
                    className="h-16 w-auto"
                  />
                </div>
                <h1 className="text-3xl font-bold text-coffee-900 mb-2">
                  Welcome Back
                </h1>
                <p className="text-coffee-600 text-sm">
                  Sign in to your account to continue
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <label htmlFor="signin-email" className="block text-sm font-medium text-coffee-900 mb-2">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="signin-email"
                    type="email"
                    name="email"
                    value={signInForm.email}
                    onChange={handleSignInChange}
                    required
                    className="w-full px-4 py-2.5 border border-coffee-300 rounded-lg bg-white text-coffee-900 placeholder:text-coffee-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="info@gmail.com"
                  />
                </div>

                <div>
                  <label htmlFor="signin-password" className="block text-sm font-medium text-coffee-900 mb-2">
                    Password<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={signInForm.password}
                      onChange={handleSignInChange}
                      required
                      className="w-full px-4 py-2.5 pr-11 border border-coffee-300 rounded-lg bg-white text-coffee-900 placeholder:text-coffee-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-500 hover:text-coffee-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="rounded border-coffee-300 text-primary-600 focus:ring-2 focus:ring-primary-500" />
                    <span className="ml-2 text-coffee-700">Remember me</span>
                  </label>
                  <Link href="/auth/forgot-password" className="text-primary-600 hover:text-primary-700 font-medium">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <p className="text-sm text-coffee-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => handleModeChange('signup')}
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </>
          )}
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
            Coffee Trace
          </h2>
          <p className="text-white/90 text-lg max-w-md">
            From Farm to Cup, Every Bean Traced
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthForm />
    </Suspense>
  );
}
