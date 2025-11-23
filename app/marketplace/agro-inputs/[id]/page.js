'use client';

import { use, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, DollarSign, TrendingUp, MapPin, Calendar, CreditCard, 
  Truck, ShoppingCart, CheckCircle, AlertCircle, ChevronLeft, Building
} from 'lucide-react';

export default function AgroInputDetailPage({ params }) {
  const unwrappedParams = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/agro-inputs/${unwrappedParams.id}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.item);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!product) return 0;
    return product.price.amount * quantity;
  };

  const handleOrder = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // TODO: Implement order creation
    alert('Order functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <Link href="/marketplace/agro-inputs" className="text-green-600 hover:underline">
            Back to marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/marketplace/agro-inputs"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to marketplace
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Product Image and Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-96 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center relative">
                <Package className="h-32 w-32 text-green-600" />
                {product.stock <= product.lowStockThreshold && (
                  <div className="absolute top-6 right-6 px-4 py-2 bg-red-500 text-white font-bold rounded-full">
                    Low Stock
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-coffee-900 mb-2">{product.name}</h1>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1 bg-green-100 text-green-700 font-semibold rounded-full">
                      {product.category}
                    </span>
                    <span className={`px-4 py-1 font-semibold rounded-full ${
                      product.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold text-coffee-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-coffee-900 mb-4">Specifications</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {product.specifications.brand && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Brand</p>
                          <p className="font-semibold text-coffee-900">{product.specifications.brand}</p>
                        </div>
                      </div>
                    )}
                    {product.specifications.manufacturer && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Building className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Manufacturer</p>
                          <p className="font-semibold text-coffee-900">{product.specifications.manufacturer}</p>
                        </div>
                      </div>
                    )}
                    {product.specifications.composition && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Package className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Composition</p>
                          <p className="font-semibold text-coffee-900">{product.specifications.composition}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {product.certifications && product.certifications.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-coffee-900 mb-4">Certifications</h2>
                  <div className="flex flex-wrap gap-2">
                    {product.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cooperative Info */}
              {product.cooperativeId && (
                <div className="border-t pt-6">
                  <h2 className="text-xl font-bold text-coffee-900 mb-4">Sold By</h2>
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                    <Building className="h-12 w-12 text-green-600" />
                    <div>
                      <p className="font-bold text-lg text-coffee-900">{product.cooperativeId.name}</p>
                      {product.cooperativeId.location && (
                        <p className="text-gray-600 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {product.cooperativeId.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="mb-6">
                <p className="text-gray-600 mb-2">Price per {product.price.unit}</p>
                <p className="text-4xl font-bold text-green-600 mb-4">
                  {product.price.currency} {product.price.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Stock Available: {product.stock}</p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-coffee-900 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-coffee-900 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  {product.paymentOptions.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={option}
                        checked={paymentMethod === option}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-green-600"
                      />
                      <span className="capitalize">{option.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Credit Terms */}
              {product.creditAvailable && paymentMethod === 'credit' && product.creditTerms && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-coffee-900 mb-3">Credit Terms</h3>
                  <div className="space-y-2 text-sm">
                    <p>Down Payment: {product.creditTerms.downPaymentPercentage}%</p>
                    <p>Installments: {product.creditTerms.installmentMonths} months</p>
                    <p>Interest Rate: {product.creditTerms.interestRate}%</p>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-lg font-bold text-coffee-900">
                  <span>Total</span>
                  <span>{product.price.currency} {calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Order Button */}
              <button
                onClick={handleOrder}
                disabled={product.stock === 0}
                className="w-full py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                {product.stock === 0 ? 'Out of Stock' : 'Place Order'}
              </button>

              {session?.user?.role === 'farmer' && (
                <p className="text-xs text-gray-600 text-center mt-4">
                  Order as {session.user.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
