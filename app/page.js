'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Coffee, Leaf, TrendingUp, Shield, MapPin, Users, Award, CheckCircle, Star, Mail, Phone, MapPinIcon, Linkedin, Twitter, Instagram, Wallet, DollarSign, ShoppingBag, CloudRain, FileCheck, QrCode, Menu, X } from 'lucide-react';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-95 backdrop-blur-sm shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image 
                src="https://res.cloudinary.com/ddew8kfxf/image/upload/v1763059666/Coffee_Trap_Mix_ky8mwv.png"
                alt="Coffee Trace Logo - Transparent Coffee Supply Chain"
                width={32}
                height={32}
                className="object-contain sm:w-10 sm:h-10"
              />
              <span className="text-lg sm:text-2xl font-bold text-coffee-900">Coffee Trace</span>
            </div>
            <nav className="hidden md:flex gap-4 lg:gap-6 items-center text-sm">
              <Link href="#" className="text-coffee-900 hover:text-primary-600 transition-colors">
                Home
              </Link>
              <Link href="#how-it-works" className="text-coffee-900 hover:text-primary-600 transition-colors">
                How It Works
              </Link>
              <Link href="/marketplace" className="text-coffee-900 hover:text-primary-600 transition-colors">
                Marketplace
              </Link>
            </nav>
            <div className="flex gap-2 sm:gap-3 items-center">
              <Link
                href="/auth/signin"
                className="hidden sm:block px-3 lg:px-4 py-2 text-sm text-coffee-900 hover:text-primary-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-coffee-900 hover:text-primary-600"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-coffee-200 shadow-lg">
            <nav className="px-4 py-4 space-y-3">
              <Link href="#" className="block text-coffee-900 hover:text-primary-600 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href="#how-it-works" className="block text-coffee-900 hover:text-primary-600 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                How It Works
              </Link>
              <Link href="/marketplace" className="block text-coffee-900 hover:text-primary-600 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                Marketplace
              </Link>
              <Link href="/auth/signin" className="block sm:hidden text-coffee-900 hover:text-primary-600 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-3 sm:px-6 lg:px-8 overflow-hidden pt-14 sm:pt-16">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/backgrounds/bkg1.mp4" type="video/mp4" />
          </video>
          {/* Gradient fallback shown before video loads (brownish/coffee palette) */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-coffee-900 via-coffee-800 to-coffee-700" />
        </div>

        {/* Content */}
        <div className="w-full max-w-7xl mx-auto relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="text-primary-300 text-sm sm:text-base font-semibold mb-4 tracking-widest uppercase">
              EUDR-ready supply chain proof
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
              From Farm to Cup,
              <br />
              <span className="text-primary-400">Every Lot Verified</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-coffee-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              QR traceability, quality grading, and compliance records—so farmers earn more and buyers trust origin.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center px-4">
              <Link
                href="/auth/signup"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started (Free)
              </Link>
              <Link
                href="/marketplace"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-transparent text-white border-2 border-white/50 rounded-lg hover:bg-white/10 hover:border-white transition-all text-base sm:text-lg font-semibold"
              >
                Browse Marketplace
              </Link>
            </div>
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-white/90 justify-center px-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-400" />
                <span><strong>500+</strong> Verified Farmers</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary-400" />
                <span><strong>EUDR</strong> Compliance</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary-400" />
                <span><strong>SCA</strong> Grading</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Badge - Positioned at bottom right of hero section */}
        <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 right-4 sm:right-6 lg:right-8 bg-white p-3 sm:p-4 rounded-lg shadow-xl hidden md:block z-20">
          <div className="flex items-center gap-2 sm:gap-3">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            <div>
              <p className="text-sm sm:text-base font-bold text-coffee-900">100% Traceable</p>
              <p className="text-xs sm:text-sm text-coffee-600">QR-Verified Origin</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section id="farmers" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-coffee-900 mb-6 sm:mb-8">
            Why Coffee Traceability Fails Today
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 text-left">
            <div className="p-4 sm:p-6 border border-coffee-200 rounded-lg bg-white">
              <div className="text-red-600 mb-3">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-coffee-900 mb-2">Unverified Origin</h3>
              <p className="text-coffee-600 text-sm">
                Buyers struggle to verify origin, quality, and ethical practices in the supply chain.
              </p>
            </div>
            <div className="p-4 sm:p-6 border border-coffee-200 rounded-lg bg-white">
              <div className="text-orange-600 mb-3">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-coffee-900 mb-2">Low Farmer Pricing Power</h3>
              <p className="text-coffee-600 text-sm">
                Smallholder farmers lack market access and data to negotiate fair prices.
              </p>
            </div>
            <div className="p-4 sm:p-6 border border-coffee-200 rounded-lg bg-white">
              <div className="text-yellow-600 mb-3">
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-coffee-900 mb-2">Compliance Is Costly</h3>
              <p className="text-coffee-600 text-sm">
                Proving sustainability and certifications is complex and costly for cooperatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="cooperatives" className="py-12 sm:py-16 lg:py-20 bg-coffee-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-coffee-900 mb-3 sm:mb-4">
              One Platform for Traceability, Trade, and Compliance
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-coffee-600 max-w-3xl mx-auto px-4">
              Built for farmers, cooperatives, exporters, and specialty buyers
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <FeatureCard
              icon={<QrCode className="h-8 w-8" />}
              title="QR Code Traceability"
              description="Track every coffee lot from harvest to export with QR codes and GPS-tagged events at each step."
              color="blue"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="EUDR Compliance"
              description="EU Deforestation Regulation compliance tracking with geolocation, risk assessment, and due diligence statements."
              color="blue"
            />
            <FeatureCard
              icon={<ShoppingBag className="h-8 w-8" />}
              title="Marketplace"
              description="Connect farmers to verified buyers, post coffee listings, and complete secure transactions directly."
              color="orange"
            />
          </div>
          <div className="text-center mt-8 sm:mt-10 lg:mt-12">
            <Link
              href="#"
              className="inline-block text-primary-600 hover:text-primary-700 font-semibold text-lg transition-colors"
            >
              See all features →
            </Link>
          </div>
        </div>
      </section>

      {/* Choose Your Path / Role Segmentation - Dashboard Entry Points */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-coffee-900 mb-3 sm:mb-4">
              Choose Your Path
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-coffee-600 max-w-2xl mx-auto px-4">
              Coffee Trace adapts to your role and goals
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* Farmer Card */}
            <div className="p-6 sm:p-8 border-2 border-coffee-200 rounded-xl hover:border-primary-600 hover:shadow-lg transition-all bg-gradient-to-br from-coffee-50 to-white">
              <div className="p-4 bg-coffee-200 rounded-lg inline-block mb-4">
                <Leaf className="h-8 w-8 text-coffee-900" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-coffee-900 mb-2">Farmer</h3>
              <p className="text-coffee-600 text-sm mb-6">Track lots, sell directly, access financing and training</p>
              <Link href="/auth/signup?role=farmer" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
                Get Started →
              </Link>
            </div>

            {/* Cooperative Card */}
            <div className="p-6 sm:p-8 border-2 border-coffee-200 rounded-xl hover:border-primary-600 hover:shadow-lg transition-all bg-gradient-to-br from-coffee-50 to-white">
              <div className="p-4 bg-orange-200 rounded-lg inline-block mb-4">
                <Users className="h-8 w-8 text-orange-900" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-coffee-900 mb-2">Cooperative</h3>
              <p className="text-coffee-600 text-sm mb-6">Manage farmers, certifications, bulk sales, and compliance</p>
              <Link href="/auth/signup?role=cooperative" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
                Get Started →
              </Link>
            </div>

            {/* Buyer Card */}
            <div className="p-6 sm:p-8 border-2 border-coffee-200 rounded-xl hover:border-primary-600 hover:shadow-lg transition-all bg-gradient-to-br from-coffee-50 to-white">
              <div className="p-4 bg-blue-200 rounded-lg inline-block mb-4">
                <ShoppingBag className="h-8 w-8 text-blue-900" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-coffee-900 mb-2">Buyer</h3>
              <p className="text-coffee-600 text-sm mb-6">Discover verified lots, verify origin, complete secure transactions</p>
              <Link href="/auth/signup?role=buyer" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
                Get Started →
              </Link>
            </div>

            {/* Investor Card */}
            <div className="p-6 sm:p-8 border-2 border-coffee-200 rounded-xl hover:border-primary-600 hover:shadow-lg transition-all bg-gradient-to-br from-coffee-50 to-white">
              <div className="p-4 bg-yellow-200 rounded-lg inline-block mb-4">
                <DollarSign className="h-8 w-8 text-yellow-900" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-coffee-900 mb-2">Investor</h3>
              <p className="text-coffee-600 text-sm mb-6">Finance farms, offer inputs, and build supply networks</p>
              <Link href="/auth/signup?role=investor" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
                Get Started →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-coffee-900 mb-3 sm:mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-coffee-600 max-w-2xl mx-auto px-4">
              Create a lot, capture events, sell with proof
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            <Step
              number="1"
              title="Register & Create Lots"
              description="Farmers register their farms and create traceable coffee lots with harvest details, GPS coordinates, and quality metrics."
              icon={<Users className="h-12 w-12" />}
            />
            <Step
              number="2"
              title="Capture Trace Events"
              description="Add events at each stage: processing, drying, grading, storage, and shipping with photos and timestamps."
              icon={<MapPin className="h-12 w-12" />}
            />
            <Step
              number="3"
              title="List & Sell Securely"
              description="Post lots on the marketplace and receive offers from verified buyers. Complete transactions securely."
              icon={<TrendingUp className="h-12 w-12" />}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-coffee-900 mb-3 sm:mb-4">
              Trusted Across the Value Chain
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-coffee-600 max-w-2xl mx-auto px-4">
              See what farmers, cooperatives, and buyers are saying
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <Testimonial
              quote="Coffee Trace helped us increase our income by 30% through direct buyer connections. The traceability features give us credibility in international markets."
              name="James Okello"
              role="Smallholder Farmer, Kenya"
              rating={5}
            />
            <Testimonial
              quote="Managing our 200+ farmers was chaotic until Coffee Trace. Now we track every lot, maintain certifications digitally, and access premium buyers directly."
              name="Sarah Nyambura"
              role="Cooperative Manager, Uganda"
              rating={5}
            />
            <Testimonial
              quote="As a specialty coffee buyer, verifying origin was always a challenge. Coffee Trace gives us complete transparency from farm to shipment."
              name="Michael Chen"
              role="Coffee Buyer, Netherlands"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Product Screenshots Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary-50 to-coffee-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-coffee-900 mb-3 sm:mb-4">
              Powerful Dashboard & Analytics
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-coffee-600 max-w-2xl mx-auto px-4">
              Intuitive tools designed for farmers, cooperatives, and buyers
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-xl">
              <div className="relative w-full h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-primary-100 to-coffee-100 rounded-lg mb-3 sm:mb-4 flex items-center justify-center">
                <Coffee className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 text-primary-600 opacity-20" />
                <span className="absolute text-coffee-900 font-bold text-base sm:text-lg">Farmer Dashboard</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-coffee-900 mb-2">Farm Management</h3>
              <p className="text-sm sm:text-base text-coffee-600">Track lots, monitor yields, manage certifications, wallet, and loans all in one place.</p>
            </div>
            <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-xl">
              <div className="relative w-full h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-green-100 to-primary-100 rounded-lg mb-3 sm:mb-4 flex items-center justify-center">
                <MapPin className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 text-green-600 opacity-20" />
                <span className="absolute text-coffee-900 font-bold text-base sm:text-lg">Marketplace</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-coffee-900 mb-2">Coffee & Agro Marketplace</h3>
              <p className="text-sm sm:text-base text-coffee-600">Browse coffee listings and purchase farming inputs with verified quality and origin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            Start Tracking Your Coffee Lots Today
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-primary-50 max-w-2xl mx-auto">
            Join thousands of farmers and buyers building a sustainable, transparent coffee future. 
            Get started today—it's free.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-all text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create Free Account
            </Link>
            <Link
              href="/marketplace"
              className="inline-block px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all text-base sm:text-lg font-semibold"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-coffee-900 text-coffee-100 py-8 sm:py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Coffee className="h-6 w-6 text-primary-400" />
                <span className="text-xl font-bold">Coffee Trace</span>
              </div>
              <p className="text-coffee-300 text-sm mb-4 max-w-xs">
                Building transparency and sustainability in the coffee value chain through technology and data.
              </p>
              <p className="text-coffee-400 text-xs mb-4">
                A product of{' '}
                <a 
                  href="http://coffeetrapagencies.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-400 font-semibold hover:text-primary-300 underline"
                >
                  Coffee Trap Agencies Ltd
                </a>
              </p>
              
              {/* Certifications */}
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="px-3 py-1 bg-coffee-800 rounded-full text-xs flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  Fairtrade
                </div>
                <div className="px-3 py-1 bg-coffee-800 rounded-full text-xs flex items-center gap-1">
                  <Leaf className="h-3 w-3" />
                  Organic
                </div>
                <div className="px-3 py-1 bg-coffee-800 rounded-full text-xs flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Rainforest Alliance
                </div>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="font-semibold mb-3 text-white">Platform</h3>
              <ul className="space-y-2 text-sm text-coffee-300">
                <li><Link href="/marketplace" className="hover:text-primary-400 transition-colors">Marketplace</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary-400 transition-colors">Dashboard</Link></li>
                <li><Link href="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
                <li><Link href="/auth/signup" className="hover:text-primary-400 transition-colors">Sign Up</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold mb-3 text-white">Resources</h3>
              <ul className="space-y-2 text-sm text-coffee-300">
                <li><Link href="/docs" className="hover:text-primary-400 transition-colors">Documentation</Link></li>
                <li><Link href="/support" className="hover:text-primary-400 transition-colors">Support</Link></li>
                <li><Link href="/api" className="hover:text-primary-400 transition-colors">API</Link></li>
                <li><Link href="/blog" className="hover:text-primary-400 transition-colors">Blog</Link></li>
              </ul>
            </div>

            {/* Contact & Social */}
            <div>
              <h3 className="font-semibold mb-3 text-white">Contact</h3>
              <ul className="space-y-2 text-sm text-coffee-300 mb-4">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:coffeetrapagencies@gmail.com" className="hover:text-primary-400 transition-colors">
                    coffeetrapagencies@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+256755017384" className="hover:text-primary-400 transition-colors">
                    +256 755 017 384
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4" />
                  <span>Kampala, Uganda</span>
                </li>
              </ul>
              
              {/* Social Links */}
              <div className="flex gap-3">
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-coffee-800 rounded-full hover:bg-primary-600 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-coffee-800 rounded-full hover:bg-primary-600 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-coffee-800 rounded-full hover:bg-primary-600 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="border-t border-coffee-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-coffee-400">
              <p>&copy; {new Date().getFullYear()} Coffee Trace. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link>
                <Link href="/cookies" className="hover:text-primary-400 transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NetworkStatsSection() {
  const [stats, setStats] = useState({
    investors: 0,
    farmers: 500,
    cooperatives: 0,
    buyers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch network stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    {
      key: 'investors',
      label: 'Investors',
      descriptor: 'Impact Partners',
      icon: TrendingUp,
      color: 'indigo',
    },
    {
      key: 'farmers',
      label: 'Farmers',
      descriptor: 'Verified',
      icon: Leaf,
      color: 'primary',
    },
    {
      key: 'cooperatives',
      label: 'Cooperatives',
      descriptor: 'Active',
      icon: Users,
      color: 'emerald',
    },
    {
      key: 'buyers',
      label: 'Buyers',
      descriptor: 'Registered',
      icon: ShoppingBag,
      color: 'blue',
    },
  ];

  const colorBgMap = {
    primary: 'bg-primary-50',
    emerald: 'bg-emerald-50',
    blue: 'bg-blue-50',
    indigo: 'bg-indigo-50',
  };

  const colorTextMap = {
    primary: 'text-primary-600',
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-coffee-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-coffee-900 mb-3 sm:mb-4">
            Our Traceable Coffee Network
          </h2>
          <p className="text-base sm:text-lg text-coffee-600 max-w-2xl mx-auto">
            Verified stakeholders participating in Coffee Trace
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statItems.map((item) => {
            const Icon = item.icon;
            const count = stats[item.key];
            const bgClass = colorBgMap[item.color];
            const textClass = colorTextMap[item.color];

            return (
              <div key={item.key} className={`${bgClass} p-6 sm:p-8 rounded-xl text-center border border-coffee-100 hover:shadow-lg transition-shadow`}>
                <div className="flex justify-center mb-4">
                  <Icon className={`h-8 w-8 ${textClass}`} />
                </div>
                <div className="mb-3">
                  <p className="text-3xl sm:text-4xl font-bold text-coffee-900">
                    {isLoading ? '—' : count.toLocaleString()}
                  </p>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-coffee-900 mb-1">
                  {item.label}
                </h3>
                <p className="text-sm text-coffee-600">{item.descriptor}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description, color = 'blue' }) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 group-hover:bg-blue-100',
    green: 'text-green-600 bg-green-50 group-hover:bg-green-100',
    purple: 'text-purple-600 bg-purple-50 group-hover:bg-purple-100',
    orange: 'text-orange-600 bg-orange-50 group-hover:bg-orange-100',
  };

  return (
    <article className="p-4 sm:p-5 lg:p-6 bg-white rounded-lg sm:rounded-xl hover:shadow-xl transition-all border border-coffee-100 hover:border-primary-200 group">
      <div className={`p-2 sm:p-3 rounded-lg mb-3 sm:mb-4 inline-block ${colorClasses[color]}`}>
        <div className="group-hover:scale-110 transition-transform">{icon}</div>
      </div>
      <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-coffee-900 mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-coffee-600">{description}</p>
    </article>
  );
}

function Step({ number, title, description, icon }) {
  return (
    <article className="text-center relative">
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-primary-200 rounded-full blur-xl opacity-30"></div>
        <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full text-2xl font-bold shadow-lg">
          {number}
        </div>
      </div>
      <div className="text-primary-600 mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold text-coffee-900 mb-3">{title}</h3>
      <p className="text-coffee-600 max-w-sm mx-auto">{description}</p>
    </article>
  );
}

function Testimonial({ quote, name, role, rating }) {
  return (
    <article className="bg-white p-8 rounded-xl shadow-lg border border-coffee-100 hover:shadow-xl transition-shadow">
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <blockquote className="text-coffee-700 mb-6 italic">"{quote}"</blockquote>
      <div className="border-t border-coffee-100 pt-4">
        <p className="font-bold text-coffee-900">{name}</p>
        <p className="text-sm text-coffee-600">{role}</p>
      </div>
    </article>
  );
}
