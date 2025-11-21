'use client';

import { Suspense } from 'react';
import BuyerTraceabilityDashboard from '@/components/dashboard/BuyerTraceabilityDashboard';

export default function BuyerTracePage({ params }) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        }>
          <BuyerTraceabilityDashboard lotId={params.lotId} />
        </Suspense>
      </div>
    </div>
  );
}
