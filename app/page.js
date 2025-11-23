import Link from 'next/link';
import Image from 'next/image';
import HeroBackground from '../components/HeroBackground';
import { Coffee, Leaf, TrendingUp, Shield, MapPin, Users, Award, CheckCircle, Star, Mail, Phone, MapPinIcon, Linkedin, Twitter, Instagram } from 'lucide-react';
import NavBar from '../components/NavBar';

export const metadata = {
  title: 'Coffee Trace - From Farm to Cup, Every Bean Traced',
  description: 'Empowering farmers with data, connecting buyers with sustainable coffee, and building a transparent value chain for climate-smart agriculture.',
  openGraph: {
    title: 'Coffee Trace - Transparent Coffee Supply Chain',
    description: 'Track every coffee bean from farm to cup with blockchain-powered traceability.',
    images: ['https://res.cloudinary.com/ddew8kfxf/image/upload/v1763059666/Coffee_Trap_Mix_ky8mwv.png'],
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <NavBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-40 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background (video with brown-gradient fallback while it loads) */}
        <HeroBackground />

        {/* Content */}
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              From Farm to Cup,
              <br />
              <span className="text-primary-400">Every Bean Traced</span>
            </h1>
            <p className="text-xl text-coffee-100 mb-8 max-w-2xl mx-auto">
              Empowering farmers with data, connecting buyers with sustainable coffee,
              and building a transparent value chain for climate-smart agriculture.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
              <Link
                href="/auth/signup?role=farmer"
                className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                I'm a Farmer
              </Link>
              <Link
                href="/auth/signup?role=buyer"
                className="px-8 py-4 bg-white text-coffee-800 border-2 border-white rounded-lg hover:bg-coffee-50 transition-all text-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                I'm a Buyer
              </Link>
              <Link
                href="/marketplace"
                className="px-8 py-4 bg-transparent text-white border-2 border-white/50 rounded-lg hover:bg-white/10 hover:border-white transition-all text-lg font-semibold"
              >
                Browse Marketplace
              </Link>
            </div>
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-white/90 justify-center">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-400" />
                <span><strong>500+</strong> Farmers</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary-400" />
                <span><strong>10+</strong> Countries</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary-400" />
                <span><strong>Certified</strong> Organic</span>
              </div>
            </div>
          </div>

          {/* Floating Badge */}
          <div className="absolute bottom-8 right-8 bg-white p-4 rounded-lg shadow-xl hidden lg:block">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-bold text-coffee-900">100% Traceable</p>
                <p className="text-sm text-coffee-600">QR-Verified Origin</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-coffee-900 dark:text-gray-100 mb-6">
            The Coffee Industry Needs Transparency
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-6 border border-coffee-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              <div className="text-red-600 dark:text-red-400 mb-3">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-coffee-900 dark:text-gray-100 mb-2">Lack of Traceability</h3>
              <p className="text-coffee-600 dark:text-gray-400 text-sm">
                Buyers struggle to verify origin, quality, and ethical practices in the supply chain.
              </p>
            </div>
            <div className="p-6 border border-coffee-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              <div className="text-orange-600 dark:text-orange-400 mb-3">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-coffee-900 dark:text-gray-100 mb-2">Farmer Income Challenges</h3>
              <p className="text-coffee-600 dark:text-gray-400 text-sm">
                Smallholder farmers lack market access and data to negotiate fair prices.
              </p>
            </div>
            <div className="p-6 border border-coffee-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              <div className="text-yellow-600 dark:text-yellow-400 mb-3">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-coffee-900 dark:text-gray-100 mb-2">Origin Verification</h3>
              <p className="text-coffee-600 dark:text-gray-400 text-sm">
                Proving sustainability and certifications is complex and costly for cooperatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-coffee-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-coffee-900 dark:text-gray-100 mb-4">
              Why Choose Coffee Trace?
            </h2>
            <p className="text-xl text-coffee-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive tools for every stakeholder in the coffee value chain
            </p>
          </div>
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
      <section id="how-it-works" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-coffee-900 dark:text-gray-100 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-coffee-600 dark:text-gray-400 max-w-2xl mx-auto">
              Three simple steps to transform your coffee supply chain
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <Step
              number="1"
              title="Register & Create Lots"
              description="Farmers register their farms and create traceable coffee lots with harvest details, GPS coordinates, and quality metrics."
              icon={<Users className="h-12 w-12" />}
            />
            <Step
              number="2"
              title="Track Every Step"
              description="Add events at each stage: processing, drying, grading, storage, and shipping with photos and timestamps."
              icon={<MapPin className="h-12 w-12" />}
            />
            <Step
              number="3"
              title="List & Sell"
              description="Post lots on the marketplace and receive offers from verified buyers. Complete transactions securely."
              icon={<TrendingUp className="h-12 w-12" />}
            />
          </div>
        </div>
      </section>

      {/* Product Screenshots Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-coffee-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-coffee-900 dark:text-gray-100 mb-4">
              Powerful Dashboard & Analytics
            </h2>
            <p className="text-xl text-coffee-600 dark:text-gray-400 max-w-2xl mx-auto">
              Intuitive tools designed for farmers, cooperatives, and buyers
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border dark:border-gray-700">
              <div className="relative w-full h-64 bg-gradient-to-br from-primary-100 to-coffee-100 dark:from-primary-900/20 dark:to-coffee-900/20 rounded-lg mb-4 flex items-center justify-center">
                <Coffee className="h-24 w-24 text-primary-600 dark:text-primary-400 opacity-20" />
                <span className="absolute text-coffee-900 dark:text-gray-100 font-bold text-lg">Farmer Dashboard</span>
              </div>
              <h3 className="text-xl font-bold text-coffee-900 dark:text-gray-100 mb-2">Farm Management</h3>
              <p className="text-coffee-600 dark:text-gray-400">Track lots, monitor yields, and manage certifications all in one place.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border dark:border-gray-700">
              <div className="relative w-full h-64 bg-gradient-to-br from-green-100 to-primary-100 dark:from-green-900/20 dark:to-primary-900/20 rounded-lg mb-4 flex items-center justify-center">
                <MapPin className="h-24 w-24 text-green-600 dark:text-green-400 opacity-20" />
                <span className="absolute text-coffee-900 dark:text-gray-100 font-bold text-lg">Marketplace</span>
              </div>
              <h3 className="text-xl font-bold text-coffee-900 dark:text-gray-100 mb-2">Global Marketplace</h3>
              <p className="text-coffee-600 dark:text-gray-400">Browse verified listings, filter by origin, quality, and certifications.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-coffee-900 dark:text-gray-100 mb-4">
              Trusted by Coffee Professionals
            </h2>
            <p className="text-xl text-coffee-600 dark:text-gray-400 max-w-2xl mx-auto">
              See what farmers, cooperatives, and buyers are saying
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
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

      {/* Final CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Coffee Journey?
          </h2>
          <p className="text-xl mb-8 text-primary-50 max-w-2xl mx-auto">
            Join thousands of farmers and buyers building a sustainable, transparent coffee future. 
            Get started today—it's free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-all text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create Free Account
            </Link>
            <Link
              href="/marketplace"
              className="inline-block px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all text-lg font-semibold"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-coffee-900 text-coffee-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
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

function FeatureCard({ icon, title, description }) {
  return (
    <article className="p-6 bg-white dark:bg-gray-800 rounded-xl hover:shadow-xl transition-all border border-coffee-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-600 group">
      <div className="text-primary-600 dark:text-primary-400 mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-semibold text-coffee-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-coffee-600 dark:text-gray-400">{description}</p>
    </article>
  );
}

function Step({ number, title, description, icon }) {
  return (
    <article className="text-center relative">
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-primary-200 dark:bg-primary-900/30 rounded-full blur-xl opacity-30"></div>
        <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white rounded-full text-2xl font-bold shadow-lg">
          {number}
        </div>
      </div>
      <div className="text-primary-600 dark:text-primary-400 mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold text-coffee-900 dark:text-gray-100 mb-3">{title}</h3>
      <p className="text-coffee-600 dark:text-gray-400 max-w-sm mx-auto">{description}</p>
    </article>
  );
}

function Testimonial({ quote, name, role, rating }) {
  return (
    <article className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-coffee-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <blockquote className="text-coffee-700 dark:text-gray-300 mb-6 italic">"{quote}"</blockquote>
      <div className="border-t border-coffee-100 dark:border-gray-700 pt-4">
        <p className="font-bold text-coffee-900 dark:text-gray-100">{name}</p>
        <p className="text-sm text-coffee-600 dark:text-gray-400">{role}</p>
      </div>
    </article>
  );
}
