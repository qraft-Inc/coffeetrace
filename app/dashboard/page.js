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
      router.replace('/auth/signin?callbackUrl=/dashboard');
      return;
    }

    // Redirect to role-specific dashboard immediately
    const role = session.user.role;
    switch (role) {
      case 'farmer':
        router.replace('/dashboard/farmer');
        break;
      case 'buyer':
        router.replace('/dashboard/buyer');
        break;
      case 'coopAdmin':
        router.replace('/dashboard/coop');
        break;
      case 'admin':
        router.replace('/dashboard/admin');
        break;
      default:
        router.replace('/');
    }
  }, [session, status, router]);

  // No loading spinner - instant redirect
  return null;
}
