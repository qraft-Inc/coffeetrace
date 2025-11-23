'use client';

import { STAT_CARD_COLORS } from '../../lib/constants';

/**
 * Reusable Stat Card Component
 * Used across all dashboards to display key metrics
 */
export default function StatCard({ icon, label, value, color = 'blue' }) {
  const colorClass = STAT_CARD_COLORS[color] || STAT_CARD_COLORS.blue;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className={`inline-flex p-2 sm:p-3 rounded-lg ${colorClass} mb-2 sm:mb-3`}>
        {icon}
      </div>
      <p className="text-xs sm:text-sm text-coffee-600 mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-coffee-900">{value}</p>
    </div>
  );
}
