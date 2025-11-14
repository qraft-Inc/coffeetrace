import Link from 'next/link';
import Image from 'next/image';
import { Coffee, Leaf, TrendingUp, Shield, MapPin, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image 
                src="https://res.cloudinary.com/ddew8kfxf/image/upload/v1763059666/Coffee_Trap_Mix_ky8mwv.png"
                alt="Coffee Trap Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-2xl font-bold text-coffee-800">Coffee Trace</span>
            </div>
            <nav className="hidden md:flex gap-6">
              <Link href="#features" className="text-coffee-700 hover:text-coffee-900">
                Features
              </Link>
              <Link href="#how-it-works" className="text-coffee-700 hover:text-coffee-900">
                How It Works
              </Link>
              <Link href="/marketplace" className="text-coffee-700 hover:text-coffee-900">
                Marketplace
              </Link>
            </nav>
            <div className="flex gap-3">
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-coffee-700 hover:text-coffee-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-coffee-900 mb-6 text-balance">
            From Farm to Cup,
            <br />
            <span className="text-primary-600">Every Bean Traced</span>
          </h1>
          <p className="text-xl text-coffee-600 max-w-3xl mx-auto mb-10 text-balance">
            Empowering farmers with data, connecting buyers with sustainable coffee,
            and building a transparent value chain for climate-smart agriculture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup?role=farmer"
              className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-lg font-semibold"
            >
              I'm a Farmer
            </Link>
            <Link
              href="/auth/signup?role=buyer"
              className="px-8 py-4 bg-white text-coffee-800 border-2 border-coffee-300 rounded-lg hover:border-coffee-400 transition-colors text-lg font-semibold"
            >
              I'm a Buyer
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-coffee-900 mb-16">
            Why Choose Coffee Trace?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Full Traceability"
              description="Track every coffee lot from harvest to export with QR codes and GPS-tagged events."
            />
            <FeatureCard
              icon={<Leaf className="h-8 w-8" />}
              title="Carbon Tracking"
              description="Measure and reduce your carbon footprint with integrated climate data."
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Data-Driven Insights"
              description="Real-time yield tracking, price analytics, and quality metrics for better decisions."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Direct Marketplace"
              description="Connect farmers and cooperatives directly with verified buyers worldwide."
            />
            <FeatureCard
              icon={<MapPin className="h-8 w-8" />}
              title="Farm Mapping"
              description="Visualize farm locations, boundaries, and growing conditions on interactive maps."
            />
            <FeatureCard
              icon={<Coffee className="h-8 w-8" />}
              title="Quality Certification"
              description="Digital certificates for organic, fair trade, and sustainable practices."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-coffee-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-coffee-900 mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <Step
              number="1"
              title="Register & Create Lots"
              description="Farmers register their farms and create traceable coffee lots with harvest details."
            />
            <Step
              number="2"
              title="Track Every Step"
              description="Add events at each stage: processing, drying, grading, storage, and shipping."
            />
            <Step
              number="3"
              title="List & Sell"
              description="Post lots on the marketplace and receive offers from verified buyers."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Coffee Journey?
          </h2>
          <p className="text-xl mb-8 text-primary-50">
            Join thousands of farmers and buyers building a sustainable coffee future.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-lg font-semibold"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-coffee-900 text-coffee-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Coffee className="h-6 w-6" />
                <span className="text-xl font-bold">Coffee Trace</span>
              </div>
              <p className="text-coffee-300 text-sm mb-3">
                Building transparency and sustainability in the coffee value chain.
              </p>
              <p className="text-coffee-400 text-xs">
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
            </div>
            <div>
              <h3 className="font-semibold mb-3">Platform</h3>
              <ul className="space-y-2 text-sm text-coffee-300">
                <li><Link href="/marketplace">Marketplace</Link></li>
                <li><Link href="/dashboard">Dashboard</Link></li>
                <li><Link href="/about">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-coffee-300">
                <li><Link href="/docs">Documentation</Link></li>
                <li><Link href="/support">Support</Link></li>
                <li><Link href="/api">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-coffee-300">
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-coffee-800 mt-8 pt-8 text-center text-sm text-coffee-400">
            <p>&copy; {new Date().getFullYear()} Coffee Trace. All rights reserved.</p>
            <p className="mt-1">
              Powered by{' '}
              <a 
                href="http://coffeetrapagencies.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 underline"
              >
                Coffee Trap Agencies Ltd
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 bg-coffee-50 rounded-xl hover:shadow-lg transition-shadow">
      <div className="text-primary-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-coffee-900 mb-2">{title}</h3>
      <p className="text-coffee-600">{description}</p>
    </div>
  );
}

function Step({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full text-xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-coffee-900 mb-2">{title}</h3>
      <p className="text-coffee-600">{description}</p>
    </div>
  );
}
