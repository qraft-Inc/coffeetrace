'use client';

import { Sprout, CloudSun, Star, BarChart3, FileCheck, QrCode, ArrowRight } from 'lucide-react';

const modules = [
  {
    number: '01',
    icon: Sprout,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-700',
    title: 'Good Agricultural Practices (GAP)',
    goal: 'Increase yield + consistency',
    summary: 'Proper spacing, pruning cycles, soil fertility management, and pest and disease control.',
    outcome: 'Higher yields, more predictable supply',
    highlight: false,
  },
  {
    number: '02',
    icon: CloudSun,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-700',
    title: 'Climate-Smart Coffee Farming',
    goal: 'Future-proof farms + align with global buyers',
    summary: 'Intercropping, soil conservation, water management, and agroforestry basics.',
    outcome: 'Climate resilience, stronger ESG story',
    highlight: false,
  },
  {
    number: '03',
    icon: Star,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    title: 'Post-Harvest Handling',
    goal: 'Unlock premium prices',
    summary: 'Selective picking, sorting and grading, drying on raised beds, clean water processing.',
    outcome: 'Better cup quality, direct price increase',
    highlight: true, // Most commercially impactful — visually emphasized
  },
  {
    number: '04',
    icon: BarChart3,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
    title: 'Coffee as a Business',
    goal: 'Turn farmers into reliable suppliers',
    summary: 'Cost tracking, profit calculation, farm planning, record keeping, and understanding buyers and pricing.',
    outcome: 'Farmers think commercially, consistent supply relationships',
    highlight: false,
  },
  {
    number: '05',
    icon: FileCheck,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-700',
    title: 'EUDR Compliance',
    goal: 'Make farmers export-ready',
    summary: 'Farm geolocation, no-deforestation compliance, farm records, and documentation requirements.',
    outcome: 'Access to EU markets, competitive advantage',
    highlight: false,
  },
  {
    number: '06',
    icon: QrCode,
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-700',
    title: 'Traceability Onboarding',
    goal: 'Digitize the supply chain',
    summary: 'Farmer registration, plot mapping, lot tracking, and digital records inside Coffee Trace.',
    outcome: 'Verified origin coffee, buyer trust, premium pricing',
    highlight: false,
  },
];

export default function FarmerProgramSection() {
  return (
    <section
      id="farmer-program"
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-stone-50 via-amber-50/40 to-white"
      data-scroll-animate="true"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16" data-scroll-animate="true">
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold tracking-widest uppercase mb-4">
            Rwenzori Model
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-coffee-900 mb-5 leading-tight">
            Coffee Trap Verified Farmer Network
          </h2>
          <p className="text-base sm:text-lg text-coffee-600 max-w-3xl mx-auto leading-relaxed">
            A field-to-market farmer development system built for quality, compliance, and premium market access.
          </p>
        </div>

        {/* Modules grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-10 sm:mb-12">
          {modules.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.number}
                className={`relative rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-0.5 ${
                  mod.highlight
                    ? 'bg-amber-700 border-amber-600 shadow-xl text-white ring-2 ring-amber-400 ring-offset-2'
                    : 'bg-white border-stone-100 shadow-sm hover:shadow-lg hover:border-primary-200'
                }`}
                data-scroll-animate="true"
                data-scroll-animate-stagger={i + 1}
              >
                {mod.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow whitespace-nowrap">
                    Highest margin impact
                  </div>
                )}

                <div className="flex items-start gap-4 mb-4">
                  <div className={`flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl ${mod.highlight ? 'bg-white/20' : mod.iconBg}`}>
                    <Icon className={`h-5 w-5 ${mod.highlight ? 'text-white' : mod.iconColor}`} />
                  </div>
                  <span className={`text-xs font-bold mt-1 ${mod.highlight ? 'text-amber-200' : 'text-coffee-400'}`}>
                    Module {mod.number}
                  </span>
                </div>

                <h3 className={`text-base font-bold mb-1 ${mod.highlight ? 'text-white' : 'text-coffee-900'}`}>
                  {mod.title}
                </h3>

                <p className={`text-xs font-semibold mb-3 ${mod.highlight ? 'text-amber-200' : 'text-primary-600'}`}>
                  Goal: {mod.goal}
                </p>

                <p className={`text-sm leading-relaxed mb-4 ${mod.highlight ? 'text-amber-100' : 'text-coffee-600'}`}>
                  {mod.summary}
                </p>

                <div className={`flex items-start gap-2 text-sm font-medium ${mod.highlight ? 'text-amber-200' : 'text-coffee-500'}`}>
                  <ArrowRight className={`h-4 w-4 mt-0.5 flex-shrink-0 ${mod.highlight ? 'text-amber-300' : 'text-primary-400'}`} />
                  <span>{mod.outcome}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Positioning statement */}
        <div className="bg-coffee-900 rounded-2xl p-6 sm:p-8 text-center">
          <p className="text-lg sm:text-xl font-semibold text-white leading-relaxed max-w-3xl mx-auto">
            This is not a stand-alone training program.{' '}
            <span className="text-primary-300">
              It is a supply chain engineering model designed to produce verified, market-ready coffee.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
