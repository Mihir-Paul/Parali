import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Heart, ShieldCheck, Sprout, Award, HelpCircle } from 'lucide-react';

export const ImpactDashboard: React.FC = () => {
  const { listings } = useAppStore();

  // Dynamic addition of Ramesh's crop listing to platform total (if complete)
  const isRameshPaid = listings.some(l => l.farmerId === 'f1' && l.status === 'Paid');
  const divertedOffset = isRameshPaid ? 3 : 0;
  const earningsOffset = isRameshPaid ? 2400 : 0;

  const data = [
    { month: 'Apr', firesPrevented: 12, volumeDiverted: 35 },
    { month: 'May', firesPrevented: 35, volumeDiverted: 110 },
    { month: 'Jun', firesPrevented: 60, volumeDiverted: 180 },
    { month: 'Jul', firesPrevented: 120, volumeDiverted: 340 },
    { month: 'Aug', firesPrevented: 198 + (isRameshPaid ? 1 : 0), volumeDiverted: 615 + divertedOffset }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-forest-950">Environmental Impact Dashboard</h2>
          <p className="text-sm text-forest-700 mt-1">
            Tracking stubble fire diversion offsets, farmer income statistics, and atmospheric carbon credits.
          </p>
        </div>
      </div>

      {/* Large Stats Display */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white border border-forest-100 p-6 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Residue Diverted</span>
          <h3 className="text-3xl font-black text-forest-900 mt-2">{(1284 + divertedOffset).toLocaleString()} tonnes</h3>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">Equivalent biomass processed</p>
        </div>

        <div className="bg-white border border-forest-100 p-6 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Farmer Payouts</span>
          <h3 className="text-3xl font-black text-slate-800 mt-2">₹{(1870000 + earningsOffset).toLocaleString('en-IN')}</h3>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">Direct bank transfers completed</p>
        </div>

        <div className="bg-white border border-forest-100 p-6 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Burns Prevented</span>
          <h3 className="text-3xl font-black text-clay-800 mt-2">{427 + (isRameshPaid ? 1 : 0)} fires</h3>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">Verified via thermal alerts</p>
        </div>

        <div className="bg-white border border-forest-100 p-6 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CO₂e Avoided</span>
          <h3 className="text-3xl font-black text-forest-850 mt-2">{(1926 + (divertedOffset * 1.5)).toFixed(1)} tCO₂e</h3>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">Calculated carbon offsets</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Chart Area */}
        <div className="lg:col-span-8 bg-white border border-forest-100 p-6 rounded-3xl shadow-sm">
          <h4 className="font-extrabold text-base text-forest-950 mb-6">Regional Biomass Diversion Over Time</h4>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4c816c" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4c816c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" stroke="#a3c2b1" fontSize={11} />
                <YAxis stroke="#a3c2b1" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="volumeDiverted" stroke="#4c816c" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVal)" name="Biomass Diverted (Tonnes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Flow explanation */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-forest-900 text-cream-50 rounded-2xl p-6 shadow-md border border-forest-800 flex-1 flex flex-col justify-between">
            <div>
              <span className="text-[10px] bg-forest-800 text-clay-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Ecosystem flow
              </span>
              <h4 className="font-extrabold text-sm text-cream-100 mt-4 uppercase">From Waste to Value</h4>
              
              <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-forest-800 flex items-center justify-center font-bold text-xs text-clay-400">1</div>
                  <span className="text-xs font-semibold text-slate-200">Residue Collected in Bales</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-forest-800 flex items-center justify-center font-bold text-xs text-clay-400">2</div>
                  <span className="text-xs font-semibold text-slate-200">Commercial Buyer Matching</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-forest-800 flex items-center justify-center font-bold text-xs text-clay-400">3</div>
                  <span className="text-xs font-semibold text-slate-200">Direct Farmer Remittance</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-forest-800 flex items-center justify-center font-bold text-xs text-clay-400">4</div>
                  <span className="text-xs font-semibold text-slate-200">Atmospheric Burning Prevented</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
