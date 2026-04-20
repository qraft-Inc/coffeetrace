'use client';

import { ArrowRight } from 'lucide-react';

const impacts = [
  {
    layer: 'Good Agricultural Practices (GAP)',
    driver: 'More consistent volume',
    outcome: 'Reliable supply pipelines, higher predictability for buyers',
    color: 'emerald',
  },
  {
    layer: 'Climate-Smart Farming',
    driver: 'Sustainability compliance',
    outcome: 'Stronger ESG story, aligned with global buyer requirements',
    color: 'sky',
  },
  {
    layer: 'Post-Harvest Handling',
    driver: 'Higher cup quality',
    outcome: 'Direct price premiums, reduced rejection rates',
    color: 'amber',
    highlight: true,
  },
  {
    layer: 'Business Skills',
    driver: 'More reliable suppliers',
    outcome: 'Consistent delivery, commercial thinking at farm level',
    color: 'purple',
  },
  {
    layer: 'EUDR Compliance',
    driver: 'Export eligibility',
    outcome: 'Access to EU markets, competitive regulatory advantage',
    color: 'red',
  },
  {
    layer: 'Traceability Onboarding',
    driver: 'Buyer trust + premium access',
    outcome: 'Verified origin, stronger negotiating position, premium pricing',
    color: 'primary',
  },
];

const colorMap = {
  emerald: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', arrow: 'text-emerald-400' },
  sky: { dot: 'bg-sky-500', badge: 'bg-sky-50 text-sky-700 border border-sky-200', arrow: 'text-sky-400' },
  amber: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border border-amber-200', arrow: 'text-amber-400' },
  purple: { dot: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700 border border-purple-200', arrow: 'text-purple-400' },
  red: { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border border-red-200', arrow: 'text-red-400' },
  primary: { dot: 'bg-primary-500', badge: 'bg-primary-50 text-primary-700 border border-primary-200', arrow: 'text-primary-400' },
};

export default function BusinessImpactSection() {
  return (
    <section
      id="business-impact"
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-coffee-900 to-coffee-800"
      data-scroll-animate="true"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16" data-scroll-animate="true">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-coffee-200 text-xs font-semibold tracking-widest uppercase mb-4 border border-white/20">
            Investment Thesis
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Why This Model Works
          </h2>
          <p className="text-base sm:text-lg text-coffee-300 max-w-2xl mx-auto">
            Each layer of the Coffee Trap Verified Farmer Network maps directly to measurable business outcomes.
          </p>
        </div>

        {/* Impact grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-10 sm:mb-12">
          {impacts.map((item, i) => {
            const c = colorMap[item.color];
            return (
              <div
                key={item.layer}
                className={`relative rounded-xl p-5 border transition-all duration-300 hover:-translate-y-0.5 ${
                  item.highlight
                    ? 'bg-amber-700/20 border-amber-500/40 ring-1 ring-amber-400/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
                data-scroll-animate="true"
                data-scroll-animate-stagger={i + 1}
              >
                {item.highlight && (
                  <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                    Margin driver
                  </div>
                )}

                {/* Layer */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${c.dot}`} />
                  <p className="text-sm font-bold text-white leading-snug">{item.layer}</p>
                </div>

                {/* Driver → Outcome */}
                <div className="flex items-start gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap ${c.badge}`}>
                    {item.driver}
                  </span>
                </div>

                <div className="flex items-start gap-2 text-sm text-coffee-300">
                  <ArrowRight className={`h-4 w-4 mt-0.5 flex-shrink-0 ${c.arrow}`} />
                  <span>{item.outcome}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing statement */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 text-center backdrop-blur-sm">
          <p className="text-lg sm:text-xl font-semibold text-white leading-relaxed max-w-3xl mx-auto">
            Coffee Trace does not only document coffee.{' '}
            <span className="text-primary-300">
              It helps build the verified supply base behind it.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
