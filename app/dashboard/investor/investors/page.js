'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InvestorsListPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/admin/investors');
  }, [router]);

  return null;
}

