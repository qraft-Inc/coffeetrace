'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Coffee, Building2, Award, MapPin, CheckCircle, Filter, Search } from 'lucide-react';

export default function VerifiedPage() {
  const [activeTab, setActiveTab] = useState('farmers');
  const [farmers, setFarmers] = useState([]);
  const [cooperatives, setCooperatives] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVerifiedMembers();
  }, []);

  const fetchVerifiedMembers = async () => {
    try {
      setLoading(true);
      
      // Fetch farmers with higher limit to show all
      const farmersRes = await fetch('/api/farmers?limit=100');
      if (farmersRes.ok) {
        const farmersData = await farmersRes.json();
        console.log('Farmers API Response:', farmersData);
        console.log('Number of farmers:', farmersData.farmers?.length);
        setFarmers(farmersData.farmers || []);
      } else {
        console.error('Failed to fetch farmers:', farmersRes.status);
      }

      // Mock cooperatives data (add API endpoint when ready)
      setCooperatives([
        {
          _id: '1',
          name: 'Mount Kenya Cooperative',
          location: { country: 'Kenya', region: 'Central' },
          memberCount: 250,
          certifications: ['Organic', 'Fairtrade'],
          established: 2010
        },
        {
          _id: '2',
          name: 'Uganda Coffee Alliance',
          location: { country: 'Uganda', region: 'Western' },
          memberCount: 180,
          certifications: ['Rainforest Alliance'],
          established: 2015
        }
      ]);

      // Mock buyers data (add API endpoint when ready)
      setBuyers([
        {
          _id: '1',
          companyName: 'Specialty Roasters Inc',
          businessType: 'roaster',
          location: { country: 'Netherlands', city: 'Amsterdam' },
          certifications: ['Fair Trade Certified'],
          verified: true
        },
        {
          _id: '2',
          companyName: 'Global Coffee Traders',
          businessType: 'trader',
          location: { country: 'USA', city: 'Seattle' },
          certifications: ['B Corp'],
          verified: true
        }
      ]);

    } catch (error) {
      console.error('Error fetching verified members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFarmers = farmers.filter(farmer =>
    farmer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farmer.location?.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCooperatives = cooperatives.filter(coop =>
    coop.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coop.location?.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBuyers = buyers.filter(buyer =>
    buyer.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    buyer.location?.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="https://res.cloudinary.com/ddew8kfxf/image/upload/v1763059666/Coffee_Trap_Mix_ky8mwv.png"
                alt="Coffee Trace Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-2xl font-bold text-coffee-800">Coffee Trace</span>
            </Link>
            <div className="flex gap-3">
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-coffee-700 hover:text-coffee-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/10 rounded-full">
              <CheckCircle className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our Verified Community
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Meet the farmers, cooperatives, and buyers who are building a transparent, 
            sustainable coffee supply chain.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">{farmers.length}+</div>
              <div className="text-coffee-600 font-medium">Verified Farmers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">{cooperatives.length}+</div>
              <div className="text-coffee-600 font-medium">Cooperatives</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">{buyers.length}+</div>
              <div className="text-coffee-600 font-medium">Verified Buyers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Search & Tabs */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
              {/* Search */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-coffee-400" />
                <input
                  type="text"
                  placeholder="Search by name or country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-2 bg-coffee-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('farmers')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    activeTab === 'farmers'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-coffee-700 hover:text-coffee-900'
                  }`}
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  Farmers
                </button>
                <button
                  onClick={() => setActiveTab('cooperatives')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    activeTab === 'cooperatives'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-coffee-700 hover:text-coffee-900'
                  }`}
                >
                  <Building2 className="h-4 w-4 inline mr-2" />
                  Cooperatives
                </button>
                <button
                  onClick={() => setActiveTab('buyers')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    activeTab === 'buyers'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-coffee-700 hover:text-coffee-900'
                  }`}
                >
                  <Coffee className="h-4 w-4 inline mr-2" />
                  Buyers
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-coffee-600">Loading verified members...</p>
            </div>
          )}

          {/* Content */}
          {!loading && (
            <>
              {/* Farmers Tab */}
              {activeTab === 'farmers' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFarmers.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-coffee-600">
                      No farmers found matching your search.
                    </div>
                  ) : (
                    filteredFarmers.map((farmer) => (
                      <FarmerCard key={farmer._id} farmer={farmer} />
                    ))
                  )}
                </div>
              )}

              {/* Cooperatives Tab */}
              {activeTab === 'cooperatives' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCooperatives.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-coffee-600">
                      No cooperatives found matching your search.
                    </div>
                  ) : (
                    filteredCooperatives.map((coop) => (
                      <CooperativeCard key={coop._id} cooperative={coop} />
                    ))
                  )}
                </div>
              )}

              {/* Buyers Tab */}
              {activeTab === 'buyers' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBuyers.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-coffee-600">
                      No buyers found matching your search.
                    </div>
                  ) : (
                    filteredBuyers.map((buyer) => (
                      <BuyerCard key={buyer._id} buyer={buyer} />
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Our Verified Community
          </h2>
          <p className="text-xl mb-8 text-primary-50">
            Become a verified member and gain access to transparent coffee trading.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-all text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Get Verified Today
          </Link>
        </div>
      </section>
    </div>
  );
}

function FarmerCard({ farmer }) {
  return (
    <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-coffee-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-full">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-bold text-coffee-900 text-lg">{farmer.name}</h3>
              <div className="flex items-center gap-1 text-sm text-coffee-600">
                <MapPin className="h-3 w-3" />
                {farmer.location?.country || 'Location unavailable'}
              </div>
            </div>
          </div>
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>

        <div className="space-y-2 text-sm text-coffee-700">
          {farmer.farmSize && (
            <div>
              <span className="font-medium">Farm Size:</span> {farmer.farmSize} hectares
            </div>
          )}
          {farmer.altitude && (
            <div>
              <span className="font-medium">Altitude:</span> {farmer.altitude}m
            </div>
          )}
        </div>

        {farmer.certifications && farmer.certifications.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {farmer.certifications.map((cert, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"
              >
                <Award className="h-3 w-3" />
                {cert}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function CooperativeCard({ cooperative }) {
  return (
    <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-coffee-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-coffee-900 text-lg">{cooperative.name}</h3>
              <div className="flex items-center gap-1 text-sm text-coffee-600">
                <MapPin className="h-3 w-3" />
                {cooperative.location?.country}, {cooperative.location?.region}
              </div>
            </div>
          </div>
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>

        <div className="space-y-2 text-sm text-coffee-700">
          <div>
            <span className="font-medium">Members:</span> {cooperative.memberCount} farmers
          </div>
          <div>
            <span className="font-medium">Established:</span> {cooperative.established}
          </div>
        </div>

        {cooperative.certifications && cooperative.certifications.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {cooperative.certifications.map((cert, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"
              >
                <Award className="h-3 w-3" />
                {cert}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function BuyerCard({ buyer }) {
  return (
    <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-coffee-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-full">
              <Coffee className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-coffee-900 text-lg">{buyer.companyName}</h3>
              <div className="flex items-center gap-1 text-sm text-coffee-600">
                <MapPin className="h-3 w-3" />
                {buyer.location?.city}, {buyer.location?.country}
              </div>
            </div>
          </div>
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>

        <div className="space-y-2 text-sm text-coffee-700">
          <div>
            <span className="font-medium">Type:</span>{' '}
            <span className="capitalize">{buyer.businessType}</span>
          </div>
        </div>

        {buyer.certifications && buyer.certifications.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {buyer.certifications.map((cert, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"
              >
                <Award className="h-3 w-3" />
                {cert}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
