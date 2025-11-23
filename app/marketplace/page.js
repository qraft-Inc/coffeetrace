'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ShoppingBag, Sprout, Coffee, ArrowRight, Package } from 'lucide-react';

export default function MarketplacePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-coffee-900 mb-4">CoffeeTrace Marketplace</h1>
          <p className="text-xl text-coffee-600 max-w-2xl mx-auto">
            Access two specialized marketplaces designed for your needs
          </p>
        </div>

        {/* Marketplace Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Coffee Marketplace */}
          <Link
            href="/marketplace/coffee"
            className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-amber-400"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl group-hover:scale-110 transition-transform">
                  <Coffee className="h-12 w-12 text-amber-700" />
                </div>
                <ArrowRight className="h-8 w-8 text-amber-600 group-hover:translate-x-2 transition-transform" />
              </div>

              <h2 className="text-3xl font-bold text-coffee-900 mb-4">Coffee Marketplace</h2>
              <p className="text-coffee-700 mb-6 text-lg leading-relaxed">
                Buy premium coffee directly from verified farmers. Browse quality lots, place orders, and track complete traceability from farm to cup.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-coffee-600">
                  <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                  <span>Direct from farmers</span>
                </div>
                <div className="flex items-center gap-3 text-coffee-600">
                  <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                  <span>Quality certified</span>
                </div>
                <div className="flex items-center gap-3 text-coffee-600">
                  <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                  <span>Full traceability</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg group-hover:from-amber-600 group-hover:to-orange-600 transition-all">
                <span>Browse Coffee</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>

            {/* Role indicator */}
            <div className="absolute top-4 right-4 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-full shadow-lg">
              For Buyers
            </div>
          </Link>

          {/* Agro-Inputs Marketplace */}
          <Link
            href="/marketplace/agro-inputs"
            className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-green-400"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl group-hover:scale-110 transition-transform">
                  <Sprout className="h-12 w-12 text-green-700" />
                </div>
                <ArrowRight className="h-8 w-8 text-green-600 group-hover:translate-x-2 transition-transform" />
              </div>

              <h2 className="text-3xl font-bold text-coffee-900 mb-4">Agro-Inputs Marketplace</h2>
              <p className="text-coffee-700 mb-6 text-lg leading-relaxed">
                Get quality agricultural inputs for your farm. Seeds, fertilizers, tools, and equipment from trusted cooperatives.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-coffee-600">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Quality farm inputs</span>
                </div>
                <div className="flex items-center gap-3 text-coffee-600">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Cooperative managed</span>
                </div>
                <div className="flex items-center gap-3 text-coffee-600">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Credit options</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg group-hover:from-green-600 group-hover:to-emerald-600 transition-all">
                <span>Browse Inputs</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>

            {/* Role indicator */}
            <div className="absolute top-4 right-4 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-full shadow-lg">
              For Farmers
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-coffee-900 text-center mb-8">Marketplace Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="inline-flex p-3 bg-amber-100 rounded-full mb-3">
                <Coffee className="h-8 w-8 text-amber-600" />
              </div>
              <p className="text-3xl font-bold text-coffee-900">250+</p>
              <p className="text-sm text-coffee-600 mt-1">Coffee Lots</p>
            </div>
            <div className="text-center">
              <div className="inline-flex p-3 bg-green-100 rounded-full mb-3">
                <Sprout className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-coffee-900">150+</p>
              <p className="text-sm text-coffee-600 mt-1">Agro Products</p>
            </div>
            <div className="text-center">
              <div className="inline-flex p-3 bg-blue-100 rounded-full mb-3">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-coffee-900">1,000+</p>
              <p className="text-sm text-coffee-600 mt-1">Transactions</p>
            </div>
            <div className="text-center">
              <div className="inline-flex p-3 bg-purple-100 rounded-full mb-3">
                <Package className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-coffee-900">98%</p>
              <p className="text-sm text-coffee-600 mt-1">Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
