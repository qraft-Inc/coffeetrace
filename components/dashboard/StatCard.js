'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Modern Stat Card Component
 * Used across all dashboards to display key metrics with trends
 */
export default function StatCard({ 
  icon, 
  label, 
  value, 
  trend = null, 
  trendLabel = '',
  color = 'primary',
  iconBgColor = null 
}) {
  // Icon background colors using Coffee Trace brand palette
  const iconColors = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    coffee: 'bg-coffee-100 dark:bg-coffee-900/30 text-coffee-600 dark:text-coffee-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  const iconBg = iconBgColor || iconColors[color] || iconColors.primary;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`inline-flex p-3 rounded-lg ${iconBg}`}>
          {icon}
        </div>
        {trend !== null && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {trend >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{value}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      
      {trendLabel && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{trendLabel}</p>
      )}
    </div>
  );
}
