'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Plus, Eye, Edit, Trash2, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import RequireAuth from '../../../../components/dashboard/RequireAuth';

const CATEGORIES = {
  seeds: { label: 'Seeds', color: 'green' },
  fertilizers: { label: 'Fertilizers', color: 'blue' },
  pesticides: { label: 'Pesticides', color: 'red' },
  tools: { label: 'Tools', color: 'gray' },
  equipment: { label: 'Equipment', color: 'purple' },
  irrigation: { label: 'Irrigation', color: 'cyan' },
};

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  pending_approval: 'bg-yellow-100 text-yellow-700',
  inactive: 'bg-gray-100 text-gray-700',
};

export default function CooperativeAgroInputsPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (session?.user) {
      fetchProducts();
    }
  }, [session, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams({
        limit: '50',
      });

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      // Fetch products for this cooperative
      const response = await fetch(`/api/agro-inputs?${params}`);
      const data = await response.json();

      if (data.success) {
        // Filter to only show products from user's cooperative
        const userCoopId = session?.user?.cooperativeId;
        const coopProducts = userCoopId 
          ? data.items.filter(item => item.cooperativeId?._id === userCoopId)
          : data.items;
        
        setProducts(coopProducts);

        // Calculate stats
        const totalProducts = coopProducts.length;
        const activeProducts = coopProducts.filter(p => p.status === 'active').length;
        const pendingProducts = coopProducts.filter(p => p.status === 'pending_approval').length;
        const totalStock = coopProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
        const totalViews = coopProducts.reduce((sum, p) => sum + (p.views || 0), 0);

        setStats({
          totalProducts,
          activeProducts,
          pendingProducts,
          totalStock,
          totalViews,
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/agro-inputs/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchProducts(); // Refresh list
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  return (
    <RequireAuth requiredRole="coopAdmin">
      <DashboardLayout title="Manage Agro-Inputs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-coffee-900 mb-2">Agro-Input Products</h1>
              <p className="text-coffee-600">Manage your cooperative's agricultural products</p>
            </div>
            <Link
              href="/dashboard/cooperative/agro-inputs/create"
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Product
            </Link>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid md:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="h-6 w-6 text-blue-600" />
                  <span className="text-sm text-coffee-600">Total Products</span>
                </div>
                <p className="text-3xl font-bold text-coffee-900">{stats.totalProducts}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <span className="text-sm text-coffee-600">Active</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{stats.activeProducts}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                  <span className="text-sm text-coffee-600">Pending</span>
                </div>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingProducts}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="h-6 w-6 text-purple-600" />
                  <span className="text-sm text-coffee-600">Total Stock</span>
                </div>
                <p className="text-3xl font-bold text-coffee-900">{stats.totalStock}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="h-6 w-6 text-gray-600" />
                  <span className="text-sm text-coffee-600">Total Views</span>
                </div>
                <p className="text-3xl font-bold text-coffee-900">{stats.totalViews}</p>
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              {Object.entries(CATEGORIES).map(([key, { label }]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    selectedCategory === key
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Products List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-coffee-600">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="h-16 w-16 text-coffee-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-coffee-900 mb-2">No products yet</h3>
                <p className="text-coffee-600 mb-6">Start by adding your first agro-input product</p>
                <Link
                  href="/dashboard/cooperative/agro-inputs/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                >
                  <Plus className="h-5 w-5" />
                  Add Product
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-coffee-900">{product.name}</div>
                            <div className="text-sm text-coffee-600 truncate max-w-xs">
                              {product.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full">
                            {CATEGORIES[product.category]?.label || product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-coffee-900">
                              {product.price.currency} {product.price.amount.toLocaleString()}
                            </div>
                            <div className="text-sm text-coffee-600">{product.price.unit}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`font-semibold ${
                            product.stock <= product.lowStockThreshold
                              ? 'text-red-600'
                              : 'text-coffee-900'
                          }`}>
                            {product.stock}
                          </div>
                          {product.stock <= product.lowStockThreshold && (
                            <div className="text-xs text-red-600">Low stock</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${STATUS_COLORS[product.status]}`}>
                            {product.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-coffee-600">
                            <Eye className="h-4 w-4" />
                            <span>{product.views || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/marketplace/agro-inputs/${product._id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="h-5 w-5" />
                            </Link>
                            <Link
                              href={`/dashboard/cooperative/agro-inputs/${product._id}/edit`}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}
