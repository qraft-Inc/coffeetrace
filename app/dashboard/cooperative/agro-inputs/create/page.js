'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Save } from 'lucide-react';
import DashboardLayout from '../../../../../components/layout/DashboardLayout';
import RequireAuth from '../../../../../components/dashboard/RequireAuth';

const CATEGORIES = [
  { value: 'seeds', label: 'Seeds' },
  { value: 'fertilizers', label: 'Fertilizers' },
  { value: 'pesticides', label: 'Pesticides' },
  { value: 'tools', label: 'Tools' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'credit', label: 'Credit' },
  { value: 'installment', label: 'Installment' },
];

export default function CreateAgroInputPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'seeds',
    price: {
      amount: '',
      currency: 'RWF',
      unit: 'per unit',
    },
    stock: '',
    lowStockThreshold: 10,
    specifications: {
      brand: '',
      manufacturer: '',
      composition: '',
    },
    certifications: [],
    tags: [],
    creditAvailable: false,
    creditTerms: {
      downPaymentPercentage: 20,
      installmentMonths: 6,
      interestRate: 5,
    },
    paymentOptions: ['cash', 'mobile_money'],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? parseFloat(value) : value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
      }));
    }
  };

  const handlePaymentOptionChange = (option) => {
    setFormData(prev => ({
      ...prev,
      paymentOptions: prev.paymentOptions.includes(option)
        ? prev.paymentOptions.filter(o => o !== option)
        : [...prev.paymentOptions, option],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/agro-inputs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: {
            ...formData.price,
            amount: parseFloat(formData.price.amount),
          },
          stock: parseInt(formData.stock),
          lowStockThreshold: parseInt(formData.lowStockThreshold),
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard/cooperative/agro-inputs');
      } else {
        alert(data.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth requiredRole="coopAdmin">
      <DashboardLayout title="Add Agro-Input Product">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard/cooperative/agro-inputs"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-4"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Products
            </Link>
            <h1 className="text-3xl font-bold text-coffee-900 mb-2">Add New Product</h1>
            <p className="text-coffee-600">Add an agricultural input product to the marketplace</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-bold text-coffee-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-coffee-900 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Premium Arabica Coffee Seeds"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-coffee-900 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe the product, its benefits, and usage..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-coffee-900 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h2 className="text-xl font-bold text-coffee-900 mb-4">Pricing</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-coffee-900 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price.amount"
                    value={formData.price.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-coffee-900 mb-2">
                    Currency
                  </label>
                  <select
                    name="price.currency"
                    value={formData.price.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="RWF">RWF</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-coffee-900 mb-2">
                    Unit
                  </label>
                  <input
                    type="text"
                    name="price.unit"
                    value={formData.price.unit}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="per kg, per bag, per piece"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div>
              <h2 className="text-xl font-bold text-coffee-900 mb-4">Inventory</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-coffee-900 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-coffee-900 mb-2">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    value={formData.lowStockThreshold}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div>
              <h2 className="text-xl font-bold text-coffee-900 mb-4">Specifications (Optional)</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-coffee-900 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="specifications.brand"
                    value={formData.specifications.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Brand name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-coffee-900 mb-2">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    name="specifications.manufacturer"
                    value={formData.specifications.manufacturer}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Manufacturer name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-coffee-900 mb-2">
                    Composition
                  </label>
                  <input
                    type="text"
                    name="specifications.composition"
                    value={formData.specifications.composition}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., NPK 10-20-10"
                  />
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div>
              <h2 className="text-xl font-bold text-coffee-900 mb-4">Payment Options</h2>
              <div className="space-y-3">
                {PAYMENT_OPTIONS.map(option => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.paymentOptions.includes(option.value)}
                      onChange={() => handlePaymentOptionChange(option.value)}
                      className="h-5 w-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-coffee-900">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Credit Terms */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  name="creditAvailable"
                  checked={formData.creditAvailable}
                  onChange={handleChange}
                  className="h-5 w-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="text-xl font-bold text-coffee-900">Offer Credit Terms</span>
              </label>

              {formData.creditAvailable && (
                <div className="grid md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-semibold text-coffee-900 mb-2">
                      Down Payment (%)
                    </label>
                    <input
                      type="number"
                      name="creditTerms.downPaymentPercentage"
                      value={formData.creditTerms.downPaymentPercentage}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-coffee-900 mb-2">
                      Installment Months
                    </label>
                    <input
                      type="number"
                      name="creditTerms.installmentMonths"
                      value={formData.creditTerms.installmentMonths}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-coffee-900 mb-2">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      name="creditTerms.interestRate"
                      value={formData.creditTerms.interestRate}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <Link
                href="/dashboard/cooperative/agro-inputs"
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-coffee-900"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-5 w-5" />
                {loading ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}
