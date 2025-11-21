'use client';

import { useState, useEffect } from 'react';
import { Package, Search, ShoppingCart } from 'lucide-react';

export default function AgroInputMarketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'seeds', label: 'Seeds & Seedlings' },
    { value: 'fertilizers', label: 'Fertilizers' },
    { value: 'pesticides', label: 'Pesticides' },
    { value: 'tools', label: 'Tools & Equipment' },
  ];

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url = category === 'all' 
        ? '/api/products?limit=50' 
        : `/api/products?category=${category}&limit=50`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-coffee-900 mb-2">Agro-Input Marketplace</h2>
        <p className="text-coffee-600">Quality seeds, fertilizers, and tools for your farm</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-coffee-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <Package className="h-16 w-16 text-coffee-300 mx-auto mb-4" />
          <p className="text-coffee-600">No products found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-sm border border-coffee-200 overflow-hidden hover:shadow-md transition-shadow">
              {product.images && product.images[0] && (
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-coffee-900">{product.name}</h3>
                  {product.isOrganic && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Organic
                    </span>
                  )}
                </div>
                <p className="text-sm text-coffee-600 mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-coffee-900">
                      {product.currency} {product.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-coffee-600">per {product.unit}</p>
                  </div>
                  <button className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    <ShoppingCart className="h-5 w-5" />
                  </button>
                </div>
                {product.stockQuantity < 10 && product.stockQuantity > 0 && (
                  <p className="mt-3 text-sm text-orange-600">
                    Only {product.stockQuantity} {product.unit}(s) left!
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
