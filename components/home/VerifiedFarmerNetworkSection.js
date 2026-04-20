'use client';

import { BookOpen, Database, ShieldCheck, Layers, TrendingUp, ArrowRight } from 'lucide-react';

const steps = [
  {
    key: 'train',
    number: '01',
    label: 'Train',
    sublabel: 'Farmer Readiness',
    icon: BookOpen,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    description:
      'Farmers are equipped with practical skills in good agricultural practices, climate-smart farming, post-harvest handling, business skills, and export compliance.',
  },
  {
    key: 'digitize',
    number: '02',
    label: 'Digitize',
    sublabel: 'Data & Onboarding',
    icon: Database,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    description:
      'Farmers are registered, plots are mapped, and production records are captured inside Coffee Trace.',
  },
  {
    key: 'verify',
    number: '03',
    label: 'Verify',
    sublabel: 'Trust & Compliance',
    icon: ShieldCheck,
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
    highlight: true,
    description:
      'Lots, practices, origin, and compliance data are verified to build buyer trust and EUDR readiness.',
  },
  {
    key: 'aggregate',
    number: '04',
    label: 'Aggregate',
    sublabel: 'Supply Coordination',
    icon: Layers,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
    description:
      'Verified coffee is organized through cooperatives and supply networks for efficient bulk trade.',
  },
  {
    key: 'sell',
    number: '05',
    label: 'Sell',
    sublabel: 'Market Access',
    icon: TrendingUp,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
    description:
      'Traceable, quality-graded coffee reaches premium buyers with stronger pricing power.',
  },
];

export default function VerifiedFarmerNetworkSection() {
  return (
    <section
      id="verified-network"
      className="py-16 sm:py-20 lg:py-24 bg-white"
      data-scroll-animate="true"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16" data-scroll-animate="true">
          <span className="inline-block px-4 py-1.5 rounded-full bg-coffee-100 text-coffee-700 text-xs font-semibold tracking-widest uppercase mb-4">
            The Verified Farmer Network
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-coffee-900 mb-5 leading-tight">
            Coffee Trace starts before the QR code.
          </h2>
          <p className="text-base sm:text-lg text-coffee-600 leading-relaxed mb-4">
            Through the <strong className="text-coffee-900">Coffee Trap Verified Farmer Network (Rwenzori Model)</strong>, farmers move through a structured pipeline before a single lot is traded.
          </p>
          <p className="text-base sm:text-lg text-coffee-600 leading-relaxed">
            We do not just trace coffee. We build export-ready farmer networks that can produce, prove, and sell verified coffee.
          </p>
        </div>

        {/* Pipeline — desktop horizontal, mobile vertical */}
        <div className="relative">
          {/* Connector line desktop */}
          <div className="hidden lg:block absolute top-[56px] left-[calc(5%+44px)] right-[calc(5%+44px)] h-0.5 bg-gradient-to-r from-amber-200 via-primary-300 via-emerald-200 to-purple-200 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 lg:gap-3 relative z-10">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex flex-col sm:block" data-scroll-animate="true" data-scroll-animate-stagger={i + 1}>
                  {/* Mobile step connector */}
                  {i > 0 && (
                    <div className="flex items-center gap-2 mb-4 sm:hidden pl-5">
                      <ArrowRight className="h-4 w-4 text-coffee-300" />
                    </div>
                  )}
                  <div
                    className={`group relative rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 ${
                      step.highlight
                        ? 'bg-primary-700 border-primary-600 shadow-lg hover:shadow-2xl'
                        : 'bg-white border-stone-100 shadow-sm hover:shadow-xl hover:border-primary-200'
                    }`}
                  >
                    {/* Step number badge */}
                    <div
                      className={`absolute -top-3 -right-3 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shadow-md ${
                        step.highlight ? 'bg-white text-primary-700' : 'bg-primary-600 text-white'
                      }`}
                    >
                      {i + 1}
                    </div>

                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${step.highlight ? 'bg-white/20 group-hover:bg-white/30' : step.iconBg} transition-colors`}
                    >
                      <Icon className={`h-6 w-6 ${step.iconColor}`} />
                    </div>

                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${step.highlight ? 'text-primary-200' : 'text-coffee-400'}`}>
                      {step.sublabel}
                    </p>
                    <h3 className={`text-xl font-bold mb-3 ${step.highlight ? 'text-white' : 'text-coffee-900'}`}>
                      {step.label}
                    </h3>
                    <p className={`text-sm leading-relaxed ${step.highlight ? 'text-primary-100' : 'text-coffee-600'}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Journey strip */}
        <div className="mt-10 sm:mt-12 bg-gradient-to-r from-coffee-50 to-amber-50 border border-coffee-100 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <p className="text-xs text-coffee-500 font-semibold uppercase tracking-widest whitespace-nowrap">
            The farmer journey
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {['Train', 'Digitize', 'Verify', 'Aggregate', 'Sell'].map((s, i, arr) => (
              <span key={s} className="flex items-center gap-2">
                <span className="font-bold text-coffee-900 text-sm sm:text-base">{s}</span>
                {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-primary-400" />}
              </span>
            ))}
          </div>
          <p className="text-sm text-coffee-600 sm:ml-auto text-center sm:text-right">
            Built on the farmer journey — not just the QR code.
          </p>
        </div>
      </div>
    </section>
  );
}
