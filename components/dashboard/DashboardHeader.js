'use client';

import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

/**
 * Shared Dashboard Header Component
 * Used across all dashboard pages
 */
export default function DashboardHeader({ session }) {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="https://res.cloudinary.com/ddew8kfxf/image/upload/v1763059666/Coffee_Trap_Mix_ky8mwv.png"
              alt="Coffee Trap Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-2xl font-bold text-coffee-800">Coffee Trace</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/marketplace" className="text-coffee-700 hover:text-coffee-900">
              Marketplace
            </Link>
            {session?.user && (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 text-coffee-700 hover:text-coffee-900"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
