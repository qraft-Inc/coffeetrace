'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Coffee, 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Leaf,
  MapPin,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

/**
 * Dashboard Sidebar Component
 * Provides navigation for role-based dashboard views
 */
export default function Sidebar({ session, collapsed = false }) {
  const pathname = usePathname();
  const role = session?.user?.role;

  // Role-based navigation items
  const getNavigationItems = () => {
    const commonItems = [
      {
        label: 'Dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
        href: `/dashboard/${role}`,
        roles: ['farmer', 'buyer', 'coopAdmin', 'admin']
      }
    ];

    const roleSpecificItems = {
      farmer: [
        {
          label: 'My Lots',
          icon: <Package className="h-5 w-5" />,
          href: '/dashboard/farmer/lots',
        },
        {
          label: 'Farm Profile',
          icon: <MapPin className="h-5 w-5" />,
          href: '/dashboard/farmer/profile',
        },
        {
          label: 'Marketplace',
          icon: <ShoppingCart className="h-5 w-5" />,
          href: '/marketplace',
        },
        {
          label: 'Analytics',
          icon: <BarChart3 className="h-5 w-5" />,
          href: '/dashboard/farmer/analytics',
        },
      ],
      buyer: [
        {
          label: 'Marketplace',
          icon: <ShoppingCart className="h-5 w-5" />,
          href: '/marketplace',
        },
        {
          label: 'My Offers',
          icon: <FileText className="h-5 w-5" />,
          href: '/dashboard/buyer/offers',
        },
        {
          label: 'Purchases',
          icon: <Coffee className="h-5 w-5" />,
          href: '/dashboard/buyer/purchases',
        },
        {
          label: 'Impact Report',
          icon: <Leaf className="h-5 w-5" />,
          href: '/dashboard/buyer/impact',
        },
      ],
      coopAdmin: [
        {
          label: 'Members',
          icon: <Users className="h-5 w-5" />,
          href: '/dashboard/coop/members',
        },
        {
          label: 'Lots Overview',
          icon: <Package className="h-5 w-5" />,
          href: '/dashboard/coop/lots',
        },
        {
          label: 'Reports',
          icon: <BarChart3 className="h-5 w-5" />,
          href: '/dashboard/coop/reports',
        },
      ],
      admin: [
        {
          label: 'Users',
          icon: <Users className="h-5 w-5" />,
          href: '/dashboard/admin/users',
        },
        {
          label: 'All Lots',
          icon: <Package className="h-5 w-5" />,
          href: '/dashboard/admin/lots',
        },
        {
          label: 'Marketplace',
          icon: <ShoppingCart className="h-5 w-5" />,
          href: '/marketplace',
        },
        {
          label: 'Analytics',
          icon: <TrendingUp className="h-5 w-5" />,
          href: '/dashboard/admin/analytics',
        },
      ],
    };

    const bottomItems = [
      {
        label: 'Messages',
        icon: <MessageSquare className="h-5 w-5" />,
        href: '/dashboard/messages',
        roles: ['farmer', 'buyer', 'coopAdmin', 'admin']
      },
      {
        label: 'Settings',
        icon: <Settings className="h-5 w-5" />,
        href: '/dashboard/settings',
        roles: ['farmer', 'buyer', 'coopAdmin', 'admin']
      },
    ];

    return {
      main: [...commonItems, ...(roleSpecificItems[role] || [])],
      bottom: bottomItems
    };
  };

  const navigation = getNavigationItems();

  const isActive = (href) => {
    if (href === `/dashboard/${role}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-64'
    } overflow-y-auto z-40`}>
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="https://res.cloudinary.com/ddew8kfxf/image/upload/v1763059666/Coffee_Trap_Mix_ky8mwv.png"
              alt="Coffee Trace"
              width={40}
              height={40}
              className="object-contain"
            />
            {!collapsed && (
              <span className="text-xl font-bold text-coffee-800 dark:text-coffee-100">Coffee Trace</span>
            )}
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.main.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  active
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                title={collapsed ? item.label : ''}
              >
                <span className={active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="text-sm">{item.label}</span>
                )}
                {!collapsed && active && (
                  <span className="ml-auto w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <nav className="px-4 py-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
          {navigation.bottom.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  active
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                title={collapsed ? item.label : ''}
              >
                <span className={active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
