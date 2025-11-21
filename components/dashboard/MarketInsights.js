'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Cloud, AlertTriangle } from 'lucide-react';

export default function MarketInsights() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      const res = await fetch('/api/market-prices?days=7');
      const data = await res.json();
      setPrices(data.latestPrices || []);
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-coffee-900">Market Insights</h2>
        <span className="text-sm text-coffee-600">Updated daily</span>
      </div>

      {/* Coffee Prices */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : prices.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-white rounded-xl">
            <DollarSign className="h-16 w-16 text-coffee-300 mx-auto mb-4" />
            <p className="text-coffee-600">No market data available</p>
          </div>
        ) : (
          prices.map((price, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-coffee-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-coffee-600">{price._id.coffeeType}</p>
                  <p className="text-xs text-coffee-500">{price._id.market}</p>
                </div>
                {price.priceChange > 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </div>
              <p className="text-3xl font-bold text-coffee-900 mb-2">
                {price.currency} {price.latestPrice?.toLocaleString()}
                <span className="text-sm font-normal text-coffee-600">/kg</span>
              </p>
              <p className={`text-sm font-semibold ${
                price.priceChange > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {price.priceChange > 0 ? '+' : ''}{price.priceChange?.toFixed(2)}% today
              </p>
            </div>
          ))
        )}
      </div>

      {/* Weather & Alerts Placeholder */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <Cloud className="h-8 w-8 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Weather Forecast</h3>
            <p className="text-blue-800 mb-3">
              Sunny conditions expected for the next 7 days. Ideal for harvesting.
            </p>
            <p className="text-sm text-blue-700">
              Temperature: 22-28°C | Rainfall: 0mm | Humidity: 65%
            </p>
          </div>
        </div>
      </div>

      {/* Export Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-coffee-200 p-6">
        <h3 className="text-lg font-semibold text-coffee-900 mb-4">Export Trends</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-coffee-50 rounded-lg">
            <div>
              <p className="font-medium text-coffee-900">European Union</p>
              <p className="text-sm text-coffee-600">Demand: High</p>
            </div>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex items-center justify-between p-3 bg-coffee-50 rounded-lg">
            <div>
              <p className="font-medium text-coffee-900">United States</p>
              <p className="text-sm text-coffee-600">Demand: Stable</p>
            </div>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex items-center justify-between p-3 bg-coffee-50 rounded-lg">
            <div>
              <p className="font-medium text-coffee-900">Middle East</p>
              <p className="text-sm text-coffee-600">Demand: Growing</p>
            </div>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
