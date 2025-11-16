"use client";

import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { usePathname } from 'next/navigation';

export default function ThemeFAB() {
  const { isDarkMode, toggleTheme } = useTheme();
  const pathname = usePathname();

  // Hide the FAB on the landing page and dashboard areas since a styled
  // toggle exists in the NavBar/TopNav for those routes
  if (!pathname) return null;
  if (pathname === '/' || pathname.startsWith('/dashboard')) return null;

  return (
    <div className="fixed right-4 bottom-6 z-50">
      <button
        onClick={toggleTheme}
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle theme"
        className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-gray-900 dark:text-gray-100 hover:scale-105 transform transition-transform focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </div>
  );
}
