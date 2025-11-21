'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, ShoppingCart, Star, Award, Package, Leaf, Sprout } from 'lucide-react';

const categories = [
  { value: '', label: 'All Products', icon: Package },
  { value: 'coffee_green', label: 'Green Coffee', icon: Leaf },
  { value: 'coffee_roasted', label: 'Roasted Coffee', icon: Leaf },
  { value: 'coffee_specialty', label: 'Specialty Coffee', icon: Award },
  { value: 'coffee_cascara', label: 'Cascara', icon: Leaf },
  { value: 'tea', label: 'Tea', icon: Leaf },
  { value: 'bananas', label: 'Bananas (Matooke)', icon: Package },
  { value: 'vanilla', label: 'Vanilla', icon: Leaf },
  { value: 'livestock', label: 'Livestock', icon: Package },
  { value: 'fertilizers', label: 'Fertilizers', icon: Sprout },
  { value: 'seedlings', label: 'Seedlings', icon: Sprout },
  { value: 'pesticides', label: 'Pesticides', icon: Sprout },
  { value: 'tools', label: 'Tools', icon: Package },
  { value: 'irrigation', label: 'Irrigation', icon: Package },
];

export default function ProductsMarketplacePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [category, search, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '12');
      
      if (category) params.append('category', category);
      if (search) params.append('search', search);

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setProducts(data.products);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-coffee-800">
              Coffee Trace
            </Link>
            <nav className="flex gap-4 items-center">
              <Link href="/marketplace" className="text-coffee-700 hover:text-coffee-900">
                Coffee Lots
              </Link>
              <Link href="/marketplace/products" className="text-primary-600 font-medium">
                Products
              </Link>
              <Link href="/dashboard" className="text-coffee-700 hover:text-coffee-900">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-coffee-900 mb-2">
            Agricultural Products Marketplace
          </h1>
          <p className="text-coffee-600">
            Coffee, tea, vanilla, livestock, and agro-inputs from verified suppliers
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Category Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-coffee-600" />
            <h2 className="text-lg font-semibold text-coffee-900">Categories</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  onClick={() => {
                    setCategory(cat.value);
                    setPage(1);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium flex flex-col items-center gap-2 ${
                    category === cat.value
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-300 text-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-center">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-2 text-coffee-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white p-12 rounded-lg text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-coffee-600 text-lg">No products found.</p>
            <button
              onClick={() => {
                setCategory('');
                setSearch('');
                setPage(1);
              }}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-coffee-300 rounded-lg hover:bg-coffee-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-coffee-600">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border border-coffee-300 rounded-lg hover:bg-coffee-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const imageUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400';
  const rating = product.ratings?.average || 0;
  const reviewCount = product.ratings?.count || 0;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.isFeatured && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-primary-600 text-white text-xs font-bold rounded">
            FEATURED
          </div>
        )}
        {product.isOrganic && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs font-bold rounded flex items-center gap-1">
            <Leaf className="h-3 w-3" />
            ORGANIC
          </div>
        )}
        {product.stockQuantity === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">OUT OF STOCK</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {product.category.replace(/_/g, ' ')}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-coffee-900 mb-2 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= rating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {rating.toFixed(1)} ({reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-2xl font-bold text-primary-600">
              {product.price.toLocaleString()}
            </span>
            <span className="text-sm text-gray-600 ml-1">
              {product.currency || 'UGX'}/{product.unit}
            </span>
          </div>
        </div>

        {/* Certifications */}
        {product.certifications && product.certifications.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.certifications.slice(0, 2).map((cert, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full flex items-center gap-1"
              >
                <Award className="h-3 w-3" />
                {cert.name}
              </span>
            ))}
          </div>
        )}

        {/* Stock Info */}
        <div className="text-sm text-gray-600 mb-3">
          <span className={product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}>
            {product.stockQuantity > 0
              ? `${product.stockQuantity} ${product.unit} in stock`
              : 'Out of stock'}
          </span>
          {product.minOrderQuantity > 1 && (
            <span className="block text-xs text-gray-500 mt-1">
              Min. order: {product.minOrderQuantity} {product.unit}
            </span>
          )}
        </div>

        {/* Supplier */}
        <div className="text-xs text-gray-500 mb-3 border-t pt-2">
          <span>Sold by: <span className="font-medium">{product.supplierName}</span></span>
          {product.supplierVerified && (
            <span className="ml-2 text-green-600">✓ Verified</span>
          )}
        </div>

        <button
          disabled={product.stockQuantity === 0}
          className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
