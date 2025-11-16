'use client';

import { signOut } from 'next-auth/react';
import { LogOut, Bell, Search, User, ChevronDown, Sun, Moon, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../ThemeProvider';

/**
 * Top Navigation Bar for Dashboard
 * Positioned on the right side with search, notifications, and user menu
 */
export default function TopNav({ session, onToggleSidebar, sidebarCollapsed }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <nav className={`fixed top-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-30 px-6 transition-all duration-300 ${
      sidebarCollapsed ? 'left-20' : 'left-64'
    }`}>
      <div className="flex items-center justify-between h-full">
        {/* Left: Sidebar Toggle + Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
          
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search or type command..."
                className="w-full pl-10 pr-20 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-500 dark:text-gray-400">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 ml-6">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <a
                    href="/dashboard/notifications"
                    className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <p className="text-sm text-gray-900 dark:text-gray-100">New offer received</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 hours ago</p>
                  </a>
                  <a
                    href="/dashboard/notifications"
                    className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <p className="text-sm text-gray-900 dark:text-gray-100">Lot status updated</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">5 hours ago</p>
                  </a>
                </div>
                <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
                  <a
                    href="/dashboard/notifications"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                  >
                    View all notifications
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Marketplace link removed (available in Sidebar) */}

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {session?.user?.name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{session?.user?.name || 'coffeetrap Agencies Limited'}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{session?.user?.email}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                    {session?.user?.role}
                  </span>
                </div>
                <a
                  href="/dashboard/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile Settings
                </a>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
