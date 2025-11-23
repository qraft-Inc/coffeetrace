'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  FileText,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Wallet,
  DollarSign,
  MapPin,
  Award,
  BarChart3,
  Home,
  Coffee,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

const roleNavigation = {
  admin: [
    { name: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/dashboard/admin/users', icon: Users },
    { name: 'Farmers', href: '/dashboard/admin/farmers', icon: Users },
    { name: 'Verification', href: '/dashboard/admin/verification', icon: Award },
    { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
  ],
  farmer: [
    { name: 'Dashboard', href: '/dashboard/farmer', icon: Home },
    { name: 'My Lots', href: '/dashboard/farmer/lots', icon: Package },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Payouts', href: '/dashboard/payouts', icon: DollarSign },
    { name: 'Profile', href: '/dashboard/farmer/profile', icon: User },
  ],
  coopAdmin: [
    { name: 'Dashboard', href: '/dashboard/coop', icon: Home },
    { name: 'Farmers', href: '/dashboard/coop/farmers', icon: Users },
    { name: 'Lots', href: '/dashboard/coop/lots', icon: Package },
    { name: 'Quality', href: '/dashboard/coop/quality', icon: Award },
    { name: 'Reports', href: '/dashboard/coop/reports', icon: FileText },
    { name: 'Settings', href: '/dashboard/coop/settings', icon: Settings },
  ],
  buyer: [
    { name: 'Dashboard', href: '/dashboard/buyer', icon: Home },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
    { name: 'My Orders', href: '/dashboard/buyer/orders', icon: Package },
    { name: 'Traceability', href: '/dashboard/buyer/trace', icon: MapPin },
    { name: 'Analytics', href: '/dashboard/buyer/analytics', icon: TrendingUp },
    { name: 'Settings', href: '/dashboard/buyer/settings', icon: Settings },
  ],
  investor: [
    { name: 'Dashboard', href: '/dashboard/investor', icon: Home },
    { name: 'Portfolio', href: '/dashboard/investor/portfolio', icon: TrendingUp },
    { name: 'Impact Metrics', href: '/dashboard/investor/impact', icon: BarChart3 },
    { name: 'Farmers', href: '/dashboard/investor/farmers', icon: Users },
    { name: 'Reports', href: '/dashboard/investor/reports', icon: FileText },
    { name: 'Settings', href: '/dashboard/investor/settings', icon: Settings },
  ],
};

export default function DashboardLayout({ children, title }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navigation = roleNavigation[session?.user?.role] || roleNavigation.farmer;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 bg-white border-r border-gray-200 ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        } w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/" className={`flex items-center gap-2 ${
              collapsed ? 'justify-center w-full' : ''
            }`}>
              <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                <Coffee className="h-6 w-6 text-white" />
              </div>
              {!collapsed && (
                <span className="text-lg font-bold text-gray-900">Coffee Trace</span>
              )}
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : ''}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors relative group ${
                    isActive
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  } ${
                    collapsed ? 'justify-center' : ''
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${
                    collapsed ? '' : 'mr-3'
                  }`} />
                  {!collapsed && <span>{item.name}</span>}
                  {collapsed && (
                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className={`flex items-center ${
              collapsed ? 'justify-center' : 'space-x-3'
            }`}>
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600" />
                </div>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session?.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate capitalize">
                    {session?.user?.role || 'Role'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${
        collapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* Desktop collapse button */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:block text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100"
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </button>

              {/* Page title */}
              {title && (
                <h1 className="text-base sm:text-xl font-semibold text-gray-900 truncate">
                  {title}
                </h1>
              )}
            </div>

            {/* Search bar */}
            <div className="flex-1 max-w-lg mx-2 sm:mx-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Notifications dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm text-gray-900">New tip received</p>
                        <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm text-gray-900">Lot verified successfully</p>
                        <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                      </div>
                    </div>
                    <div className="px-4 py-2 border-t border-gray-200">
                      <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:block" />
                </button>

                {/* Profile dropdown menu */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="h-4 w-4 mr-3" />
                      Your Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-3 sm:p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
