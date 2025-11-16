"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from './ThemeProvider';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const panelRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && open) setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm sticky top-0 z-50 border-b dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="https://res.cloudinary.com/ddew8kfxf/image/upload/v1763059666/Coffee_Trap_Mix_ky8mwv.png"
                alt="Coffee Trace"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-xl font-bold text-coffee-800 dark:text-gray-100">Coffee Trace</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-coffee-700 dark:text-gray-300 hover:text-coffee-900 dark:hover:text-gray-100 transition-colors duration-200 hover:underline hover:underline-offset-4 hover:decoration-primary-600">Features</Link>
            <Link href="#how-it-works" className="text-coffee-700 dark:text-gray-300 hover:text-coffee-900 dark:hover:text-gray-100 transition-colors duration-200 hover:underline hover:underline-offset-4 hover:decoration-primary-600">How It Works</Link>
            <Link href="#testimonials" className="text-coffee-700 dark:text-gray-300 hover:text-coffee-900 dark:hover:text-gray-100 transition-colors duration-200 hover:underline hover:underline-offset-4 hover:decoration-primary-600">Testimonials</Link>
            {/* Marketplace removed from home nav (for signed users only) */}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
              className="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800 text-coffee-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="hidden sm:inline text-sm">{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>

            <Link href="/auth/signin" className="px-4 py-2 text-coffee-700 dark:text-gray-300 hover:text-coffee-900 dark:hover:text-gray-100 font-medium transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Sign In</Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium shadow-sm hover:shadow-lg transform hover:-translate-y-0.5">Get Started</Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              className="p-2 rounded-md text-coffee-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel (absolute, scrollable) */}
      <div
        className={`md:hidden absolute left-0 right-0 top-full z-40 transform transition-all duration-200 ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
        aria-hidden={!open}
      >
          <div ref={panelRef} className="mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-b-lg w-full max-w-full border-t dark:border-gray-800">
          <div className="px-4 pb-6 pt-4">
            <div className="space-y-3 max-h-[calc(100vh-64px)] overflow-auto">
              <Link href="#features" onClick={() => setOpen(false)} className="block text-coffee-700 dark:text-gray-300 hover:text-coffee-900 dark:hover:text-gray-100 px-2 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Features</Link>
              <Link href="#how-it-works" onClick={() => setOpen(false)} className="block text-coffee-700 dark:text-gray-300 hover:text-coffee-900 dark:hover:text-gray-100 px-2 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">How It Works</Link>
              <Link href="#testimonials" onClick={() => setOpen(false)} className="block text-coffee-700 dark:text-gray-300 hover:text-coffee-900 dark:hover:text-gray-100 px-2 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Testimonials</Link>
              {/* Marketplace removed from home nav (for signed users only) */}

              <div className="mt-4 border-t dark:border-gray-800 pt-4 flex flex-col gap-3">
                <Link href="/auth/signin" onClick={() => setOpen(false)} className="block text-center px-4 py-2 rounded-md text-coffee-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Sign In</Link>
                <Link href="/auth/signup" onClick={() => setOpen(false)} className="block text-center px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-0.5">Get Started</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
