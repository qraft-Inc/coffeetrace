'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { LogOut, Coffee, Bell, Search, Menu, User } from 'lucide-react';
import { useState } from 'react';

/**
 * Modern Dashboard Header Component
 * Used across all dashboard pages
 */
export default function DashboardHeader({ session }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-br from-coffee-600 to-coffee-800 p-2 rounded-lg">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-coffee-800 to-coffee-600 bg-clip-text text-transparent">
              Coffee Trace
            </span>
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Search className="h-4 w-4" />
              <span>Search or type command...</span>
              <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-white border border-gray-200 rounded">⌘K</kbd>
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Marketplace Link */}
            <Link 
              href="/marketplace" 
              className="hidden md:block px-4 py-2 text-sm font-medium text-coffee-700 hover:text-coffee-900 hover:bg-coffee-50 rounded-lg transition-colors"
            >
              Marketplace
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {session?.user?.name}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500">{session?.user?.email}</p>
                  </div>
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
