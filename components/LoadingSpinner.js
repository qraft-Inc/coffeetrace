'use client';

import Image from 'next/image';

/**
 * Loading Spinner Component
 * Uses the Coffee Trace logo with a spinning animation
 */
export default function LoadingSpinner({ size = 'md', fullScreen = false }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeClasses[size]} relative animate-spin`}>
        <Image
          src="https://res.cloudinary.com/ddew8kfxf/image/upload/v1763059666/Coffee_Trap_Mix_ky8mwv.png"
          alt="Loading"
          fill
          className="object-contain"
          priority
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
        Loading...
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
