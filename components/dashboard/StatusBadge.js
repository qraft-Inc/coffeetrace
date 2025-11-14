'use client';

import { getStatusColor } from '../../lib/constants';

/**
 * Reusable Status Badge Component
 * Displays status with appropriate colors
 */
export default function StatusBadge({ status, type = 'lot' }) {
  const colorClass = getStatusColor(status, type);

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>
      {status}
    </span>
  );
}
