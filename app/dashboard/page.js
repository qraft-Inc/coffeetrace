'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Coffee } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=/dashboard');
      return;
    }

    // Redirect to role-specific dashboard
    const role = session.user.role;
    switch (role) {
      case 'farmer':
        router.push('/dashboard/farmer');
        break;
      case 'buyer':
        router.push('/dashboard/buyer');
        break;
      case 'coopAdmin':
        router.push('/dashboard/coop');
        break;
      case 'admin':
        router.push('/dashboard/admin');
        break;
      default:
        router.push('/');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Coffee className="h-12 w-12 text-coffee-600 mx-auto mb-4 animate-pulse" />
          <p className="text-coffee-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return null;
}
