import React, { useState } from 'react';
import { Sprout, ArrowRight, Flame, ShieldAlert, Award, TrendingUp, Compass, Heart } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [activeStory, setActiveStory] = useState<'before' | 'after'>('before');

  return (
    <div className="min-h-screen bg-cream-50 text-forest-950 font-sans">
      {/* Top Banner */}
      <div className="bg-forest-900 text-cream-50 py-2.5 px-4 text-center text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2">
        <Award className="h-4 w-4 text-clay-400" />
        Smart India Hackathon 2026 Focus • Prevent Crop Stubble Burning & Double Farmer Income
      </div>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 py-20 lg:py-32 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-100/60 border border-forest-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse"></span>
            <span className="text-xs font-bold text-forest-800">AI-Powered Agritech Platform</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-forest-950 leading-tight">
            Turn crop waste into <span className="text-clay-700">farmer income</span>.
          </h1>
          
          <p className="text-lg lg:text-xl text-forest-800 mt-6 max-w-xl leading-relaxed">
            Parali connects farmers with industrial buyers who value crop residue, while AI optimizes collection routes, prices materials, and tracks direct CO₂ prevention.
          </p>

          <div className="flex flex-wrap gap-4 mt-8 w-full sm:w-auto">
            <button 
              onClick={onStart}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-forest-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-forest-800/10 hover:bg-forest-700 hover:-translate-y-0.5 transition-all text-base"
            >
              Start with Parali <ArrowRight className="h-4 w-4" />
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('storytelling');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center bg-white text-forest-800 font-bold border border-forest-200 px-8 py-4 rounded-xl hover:bg-forest-50 transition-all text-base"
            >
              Explore Transformation
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-forest-100 w-full">
            <div>
              <h4 className="text-2xl font-black text-forest-900">1,284 t</h4>
              <p className="text-xs text-forest-600 font-medium">Residue Diverted</p>
            </div>
            <div>
              <h4 className="text-2xl font-black text-forest-900">₹18.7L+</h4>
              <p className="text-xs text-forest-600 font-medium">Paid to Farmers</p>
            </div>
            <div>
              <h4 className="text-2xl font-black text-forest-900">1,926 t</h4>
              <p className="text-xs text-forest-600 font-medium">CO₂e Diverted</p>
            </div>
          </div>
        </div>

        {/* Visual Fields Graphic */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative w-full max-w-md aspect-square bg-[#ebdcc1]/40 border border-forest-100 rounded-3xl p-6 shadow-inner flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-forest-100 rounded-full filter blur-3xl opacity-50"></div>
            
            {/* Visual fields mapping grid */}
            <div className="grid grid-cols-4 gap-3 h-full w-full opacity-80 pointer-events-none relative z-10">
              <div className="bg-forest-100/80 rounded-xl border border-forest-200/40 p-2 flex flex-col justify-end">
                <span className="text-[10px] font-bold text-forest-700">Farm A</span>
              </div>
              <div className="bg-clay-100/80 rounded-xl border border-clay-200/40 p-2 flex flex-col justify-end">
                <span className="text-[10px] font-bold text-clay-700">Pickup</span>
              </div>
              <div className="col-span-2 bg-forest-200/40 rounded-xl border border-forest-300/30 p-2 flex flex-col justify-end">
                <span className="text-[10px] font-bold text-forest-800">Buffer Zone</span>
              </div>
              
              <div className="col-span-2 bg-cream-100 rounded-xl border border-forest-200/40 p-3 flex flex-col justify-between">
                <Sprout className="h-5 w-5 text-forest-600" />
                <span className="text-[9px] font-bold text-slate-500">Residue Available</span>
              </div>
              <div className="bg-forest-300/30 rounded-xl border border-forest-200/40 p-2 flex flex-col justify-end"></div>
              <div className="bg-clay-200/40 rounded-xl border border-clay-300/40 p-2 flex flex-col justify-end"></div>

              <div className="col-span-4 bg-forest-900 text-cream-50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-clay-300">AI Route Optimization</h4>
                  <p className="text-sm font-black mt-1">14 Farms Optimized</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-forest-800 flex items-center justify-center font-bold text-xs text-clay-400">
                  -33%
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Storytelling Before/After Transition Section */}
      <section id="storytelling" className="py-20 bg-forest-950 text-cream-50 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-cream-100">
            How Parali Alters the Lifecycle of Crop Residue
          </h2>
          <p className="text-slate-300 mt-4 max-w-xl mx-auto">
            Stubble burning is a result of tight sowing timelines and lack of market routes. Parali creates the alternative.
          </p>

          {/* Toggle Button */}
          <div className="inline-flex bg-forest-900 border border-forest-800 rounded-xl p-1.5 mt-8 mb-12">
            <button
              onClick={() => setActiveStory('before')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                activeStory === 'before' ? 'bg-clay-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="h-4 w-4" /> Before Parali (Waste & Pollution)
            </button>
            <button
              onClick={() => setActiveStory('after')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                activeStory === 'after' ? 'bg-forest-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sprout className="h-4 w-4" /> After Parali (Wealth & Impact)
            </button>
          </div>

          {/* Interactive transformation cards */}
          <div className="grid md:grid-cols-5 gap-6 text-left items-stretch">
            {activeStory === 'before' ? (
              <>
                <div className="bg-forest-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="text-3xl mb-4">🌾</div>
                  <div>
                    <h4 className="font-bold text-cream-100 text-sm uppercase">1. Crop Residue</h4>
                    <p className="text-xs text-slate-400 mt-2">Millions of tonnes of residue left after harvest.</p>
                  </div>
                </div>
                <div className="bg-forest-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="text-3xl mb-4">⏳</div>
                  <div>
                    <h4 className="font-bold text-cream-100 text-sm uppercase">2. Sowing Pressure</h4>
                    <p className="text-xs text-slate-400 mt-2">Farmers have only 15-20 days to clear fields for next crop.</p>
                  </div>
                </div>
                <div className="bg-clay-950/40 border border-clay-900/60 p-6 rounded-2xl flex flex-col justify-between ring-2 ring-clay-800">
                  <div className="text-3xl mb-4">🔥</div>
                  <div>
                    <h4 className="font-bold text-clay-400 text-sm uppercase">3. Crop Burning</h4>
                    <p className="text-xs text-slate-400 mt-2">Stubble is lit on fire to clear the field quickly.</p>
                  </div>
                </div>
                <div className="bg-forest-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="text-3xl mb-4">💨</div>
                  <div>
                    <h4 className="font-bold text-cream-100 text-sm uppercase">4. Air Pollution</h4>
                    <p className="text-xs text-slate-400 mt-2">Dense smog covers regions, creating public health crises.</p>
                  </div>
                </div>
                <div className="bg-forest-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="text-3xl mb-4">📉</div>
                  <div>
                    <h4 className="font-bold text-cream-100 text-sm uppercase">5. Zero Income</h4>
                    <p className="text-xs text-slate-400 mt-2">Farmers incur soil nutrient loss and gain no revenue.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-forest-900/60 border border-forest-800/80 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="text-3xl mb-4">🌾</div>
                  <div>
                    <h4 className="font-bold text-cream-100 text-sm uppercase">1. Residue Listed</h4>
                    <p className="text-xs text-slate-400 mt-2">Farmer listings uploaded with photo and details in seconds.</p>
                  </div>
                </div>
                <div className="bg-forest-900/60 border border-forest-800/80 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="text-3xl mb-4">🤖</div>
                  <div>
                    <h4 className="font-bold text-cream-100 text-sm uppercase">2. AI Matching</h4>
                    <p className="text-xs text-slate-400 mt-2">AI pairs listings with nearby bio-energy & paper manufacturers.</p>
                  </div>
                </div>
                <div className="bg-forest-900/60 border border-forest-800/80 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="text-3xl mb-4">🚛</div>
                  <div>
                    <h4 className="font-bold text-cream-100 text-sm uppercase">3. Smart Logistics</h4>
                    <p className="text-xs text-slate-400 mt-2">Collection routes are automatically batched to minimize transport cost.</p>
                  </div>
                </div>
                <div className="bg-forest-900/60 border border-forest-800/80 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="text-3xl mb-4">💰</div>
                  <div>
                    <h4 className="font-bold text-cream-100 text-sm uppercase">4. Farmer Earnings</h4>
                    <p className="text-xs text-slate-400 mt-2">Direct payouts are transferred upon verified residue collection.</p>
                  </div>
                </div>
                <div className="bg-forest-800/50 border border-forest-500/50 p-6 rounded-2xl flex flex-col justify-between ring-2 ring-forest-600">
                  <div className="text-3xl mb-4">🌱</div>
                  <div>
                    <h4 className="font-bold text-forest-400 text-sm uppercase">5. Green Impact</h4>
                    <p className="text-xs text-slate-400 mt-2">Carbon avoidance offsets logged and certified on dashboard.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Main Core Value Features */}
      <section className="py-20 max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        <div className="bg-white border border-forest-100 p-8 rounded-2xl shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-forest-100 flex items-center justify-center text-forest-700 mb-6">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-forest-950">AI Valuation & Marketplace</h3>
          <p className="text-sm text-forest-800 mt-3 leading-relaxed">
            Eliminate price uncertainty. Parali AI checks crop type, quantity, moisture indices, and buyer demands to predict a fair market price for stubble.
          </p>
        </div>

        <div className="bg-white border border-forest-100 p-8 rounded-2xl shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-forest-100 flex items-center justify-center text-forest-700 mb-6">
            <Compass className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-forest-950">Route Optimization Engine</h3>
          <p className="text-sm text-forest-800 mt-3 leading-relaxed">
            Logistics constitutes 60% of residue valorization costs. Our route batching algorithms cluster farms, saving substantial truck fuel and turnaround times.
          </p>
        </div>

        <div className="bg-white border border-forest-100 p-8 rounded-2xl shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-forest-100 flex items-center justify-center text-forest-700 mb-6">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-forest-950">Satellite Fire Spotting</h3>
          <p className="text-sm text-forest-800 mt-3 leading-relaxed">
            Automated alerts connect local burning fire regions with instant commercial procurement teams, offering a financial incentive to stop the burn.
          </p>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-forest-900 py-16 px-6 text-center text-cream-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold">The next harvest shouldn't end in a fire.</h2>
          <p className="text-sm text-clay-200 mt-3">Join other progressive farmers and sustainable buyers across Punjab & Haryana today.</p>
          <button 
            onClick={onStart}
            className="mt-8 bg-clay-500 hover:bg-clay-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all"
          >
            Launch Demo Dashboard
          </button>
        </div>
      </footer>
    </div>
  );
};
