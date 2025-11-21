'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RequireAuth({ children, requiredRole = null }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    // Not authenticated
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Check role if required
    if (requiredRole && session.user?.role !== requiredRole) {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router, requiredRole]);

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-coffee-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-coffee-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Wrong role
  if (requiredRole && session.user?.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-coffee-600">Access denied. Redirecting...</p>
        </div>
      </div>
    );
  }

  return children;
}
