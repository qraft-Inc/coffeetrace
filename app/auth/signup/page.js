'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SignUpRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Redirect to unified auth page in signup mode
    const role = searchParams.get('role') || '';
    const roleParam = role ? `&role=${role}` : '';
    router.replace(`/auth?mode=signup${roleParam}`);
  }, [router, searchParams]);

  return null;
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpRedirect />
    </Suspense>
  );
}
