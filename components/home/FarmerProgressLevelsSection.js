'use client';

import { BookOpen, QrCode, Award } from 'lucide-react';

const tiers = [
  {
    level: 1,
    icon: BookOpen,
    label: 'Trained Farmer',
    color: 'amber',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    ring: 'ring-amber-200',
    description:
      'Completed core agronomy, post-harvest, and business readiness training.',
    indicators: ['GAP certified', 'Post-harvest trained', 'Business skills'],
  },
  {
    level: 2,
    icon: QrCode,
    label: 'Traceable Farmer',
    color: 'primary',
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-700',
    badge: 'bg-primary-100 text-primary-800 border-primary-200',
    ring: 'ring-primary-300',
    description:
      'Digitally onboarded with mapped plots, farm records, and traceability data.',
    indicators: ['Plot mapped', 'Farm records active', 'Lot tracking enabled'],
  },
  {
    level: 3,
    icon: Award,
    label: 'Export-Ready Farmer',
    color: 'green',
    iconBg: 'bg-emerald-700',
    iconColor: 'text-white',
    badge: 'bg-emerald-700 text-white border-emerald-700',
    ring: 'ring-emerald-400',
    description:
      'Verified for quality, compliance, and premium buyer requirements.',
    indicators: ['EUDR compliant', 'Quality graded', 'Premium buyer–ready'],
    highlight: true,
  },
];

export default function FarmerProgressLevelsSection() {
  return (
    <section
      id="farmer-progress"
      className="py-16 sm:py-20 lg:py-24 bg-white"
      data-scroll-animate="true"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-14" data-scroll-animate="true">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold tracking-widest uppercase mb-4">
            Farmer Certification
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-coffee-900 mb-5 leading-tight">
            Farmer Progress Levels
          </h2>
          <p className="text-base sm:text-lg text-coffee-600 max-w-2xl mx-auto">
            A tiered readiness model that helps cooperatives, partners, buyers, and funders quickly
            understand farmer readiness across the network.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 mb-10">
          {tiers.map((tier, i) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.level}
                className={`relative rounded-2xl p-6 sm:p-8 border-2 transition-all duration-300 hover:-translate-y-1 ${
                  tier.highlight
                    ? 'bg-coffee-900 border-emerald-600 shadow-2xl ring-2 ring-emerald-400/40'
                    : 'bg-white border-coffee-100 shadow-md hover:shadow-xl hover:border-primary-300'
                }`}
                data-scroll-animate="true"
                data-scroll-animate-stagger={i + 1}
              >
                {/* Level badge */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${tier.iconBg} ${tier.highlight ? 'ring-2 ring-emerald-400/40' : ''}`}>
                    <Icon className={`h-7 w-7 ${tier.iconColor}`} />
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${tier.badge}`}>
                    Level {tier.level}
                  </span>
                </div>

                <h3 className={`text-xl font-bold mb-3 ${tier.highlight ? 'text-white' : 'text-coffee-900'}`}>
                  {tier.label}
                </h3>
                <p className={`text-sm leading-relaxed mb-5 ${tier.highlight ? 'text-coffee-300' : 'text-coffee-600'}`}>
                  {tier.description}
                </p>

                <ul className="space-y-2">
                  {tier.indicators.map((ind) => (
                    <li key={ind} className={`flex items-center gap-2 text-sm font-medium ${tier.highlight ? 'text-emerald-300' : 'text-coffee-700'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tier.highlight ? 'bg-emerald-400' : 'bg-primary-400'}`} />
                      {ind}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Progress illustration */}
        <div className="hidden sm:flex items-center justify-center gap-0 mb-10">
          {tiers.map((tier, i) => (
            <div key={tier.level} className="flex items-center">
              <div className={`w-4 h-4 rounded-full border-2 ${tier.highlight ? 'bg-emerald-500 border-emerald-500' : 'bg-primary-400 border-primary-400'}`} />
              {i < tiers.length - 1 && (
                <div className="w-32 sm:w-48 h-0.5 bg-gradient-to-r from-primary-300 to-primary-400" />
              )}
            </div>
          ))}
        </div>

        {/* Supporting line */}
        <p className="text-center text-sm sm:text-base text-coffee-500 max-w-2xl mx-auto">
          This tiered model helps cooperatives, partners, buyers, and funders quickly understand farmer
          readiness across the network.
        </p>
      </div>
    </section>
  );
}
