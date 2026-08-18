import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../context/AuthContext';
import { IndianRupee, Sprout, ShieldCheck, CheckCircle2, ChevronRight, FileSpreadsheet, MapPin } from 'lucide-react';

interface FarmerDashboardProps {
  onNavigateToSell: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ onNavigateToSell }) => {
  const { listings, completePickup, demoStep } = useAppStore();
  const { profile, farmerProfile, user } = useAuth();

  const farmerName = profile?.full_name || user?.user_metadata?.full_name || 'Ramesh Kumar';
  const primaryCrop = farmerProfile?.primary_crop || 'Wheat';
  const landArea = farmerProfile?.land_area_acres || 5;
  const estimatedTonnes = farmerProfile?.estimated_residue_tonnes || 10;
  const locationText = profile?.village ? `${profile.village}, ${profile.district}` : 'Sangrur, Punjab';

  const metrics = {
    earnings: 7450,
    divertedTonnes: estimatedTonnes > 0 ? Number(estimatedTonnes) : 6.3,
    burnsPrevented: Math.max(1, Math.round((estimatedTonnes || 6) * 0.8))
  };

  // Get active listing for current user
  const rameshListing = listings.find(l => l.farmerId === 'f1' || l.farmerId === 'f_new' || l.farmerId === profile?.id);

  const getTimelineStep = (status: string) => {
    switch (status) {
      case 'Listed': return 1;
      case 'Matched': return 2;
      case 'Confirmed': return 3;
      case 'Pickup': return 4;
      case 'Paid': return 5;
      default: return 0;
    }
  };

  const timelineStep = rameshListing ? getTimelineStep(rameshListing.status) : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-forest-600 mb-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{locationText} • {landArea} Acres ({primaryCrop})</span>
          </div>
          <h2 className="text-3xl font-extrabold text-forest-950">
            Good morning, {farmerName} 👋
          </h2>
          <p className="text-sm text-forest-700 mt-1">
            Here is what's happening with your agricultural residue.
          </p>
        </div>
        <button
          onClick={onNavigateToSell}
          className="bg-forest-600 hover:bg-forest-700 text-white font-extrabold px-6 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2"
        >
          <Sprout className="h-4 w-4" /> Sell Crop Residue
        </button>
      </div>

      {/* 3D-effect Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white border border-forest-100 p-6 rounded-3xl shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-forest-600 uppercase tracking-wider">Total Earnings</span>
            <div className="p-2.5 bg-forest-50 text-forest-600 rounded-xl"><IndianRupee className="h-4 w-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-forest-950">₹{metrics.earnings}</h3>
          <p className="text-[10px] text-forest-500 font-semibold mt-1">↑ 18.4% from last harvest</p>
        </div>

        <div className="bg-white border border-forest-100 p-6 rounded-3xl shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-forest-600 uppercase tracking-wider">Est. Season Residue</span>
            <div className="p-2.5 bg-forest-50 text-forest-600 rounded-xl"><Sprout className="h-4 w-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-forest-950">
            {metrics.divertedTonnes.toFixed(1)} tonnes
          </h3>
          <p className="text-[10px] text-forest-500 font-semibold mt-1">{primaryCrop} Straw</p>
        </div>

        <div className="bg-white border border-forest-100 p-6 rounded-3xl shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-forest-600 uppercase tracking-wider">Active Buyers</span>
            <div className="p-2.5 bg-forest-50 text-forest-600 rounded-xl"><FileSpreadsheet className="h-4 w-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-forest-950">3 Interested</h3>
          <p className="text-[10px] text-forest-500 font-semibold mt-1">Matching bio-fuel factories</p>
        </div>

        <div className="bg-white border border-forest-100 p-6 rounded-3xl shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-forest-600 uppercase tracking-wider">Burning Avoided</span>
            <div className="p-2.5 bg-forest-50 text-forest-600 rounded-xl"><ShieldCheck className="h-4 w-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-forest-950">{(metrics.divertedTonnes * 1.5).toFixed(1)} tCO₂e</h3>
          <p className="text-[10px] text-forest-500 font-semibold mt-1">Prevented from stubble fires</p>
        </div>
      </div>

      {/* Central "Your Next Pickup" Card */}
      {rameshListing && rameshListing.status !== 'Paid' ? (
        <div className="bg-white border-2 border-forest-200 rounded-3xl p-8 mb-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-forest-50 rounded-full filter blur-2xl opacity-40"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <span className="text-[10px] bg-forest-100 text-forest-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Residue status: {rameshListing.status}
              </span>
              <h3 className="text-2xl font-extrabold text-forest-950 mt-2">
                Pickup Schedule for {rameshListing.quantity} tonnes {rameshListing.cropType} Straw
              </h3>
            </div>

            {rameshListing.status === 'Confirmed' && (
              <div className="flex items-center gap-4 bg-forest-50/80 border border-forest-100 p-4 rounded-2xl">
                <span className="text-2xl">🚛</span>
                <div>
                  <h4 className="font-extrabold text-xs text-forest-900 leading-none">Truck #PB-08-AX-2411</h4>
                  <p className="text-[10px] text-forest-600 mt-1">Arriving today at 10:40 AM (2.8 km away)</p>
                </div>
              </div>
            )}
          </div>

          {/* Progress Timeline */}
          <div className="relative flex items-center justify-between w-full mt-6 mb-4">
            <div className="absolute left-0 right-0 h-1 bg-slate-100 top-1/2 -translate-y-1/2 z-0"></div>
            <div
              className="absolute left-0 h-1 bg-forest-600 top-1/2 -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${((timelineStep - 1) / 4) * 100}%` }}
            ></div>

            {['Listed', 'Matched', 'Confirmed', 'Pickup', 'Paid'].map((stepName, i) => {
              const stepIndex = i + 1;
              const isActive = timelineStep >= stepIndex;
              const isCurrent = timelineStep === stepIndex;

              return (
                <div key={stepName} className="relative z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-forest-600 border-forest-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-400'
                  } ${isCurrent ? 'ring-4 ring-forest-100 scale-110' : ''}`}>
                    {isActive ? '✓' : stepIndex}
                  </div>
                  <span className={`text-[10px] font-bold mt-2 uppercase tracking-wide ${
                    isActive ? 'text-forest-900' : 'text-slate-400'
                  }`}>
                    {stepName}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Prompt to mark pickup complete during demo */}
          {rameshListing.status === 'Confirmed' && demoStep === 7 && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => completePickup(rameshListing.id)}
                className="bg-clay-600 hover:bg-clay-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" /> Confirm Pickup & Receive Payment
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-forest-100 rounded-3xl p-12 text-center shadow-sm mb-10">
          <div className="w-16 h-16 rounded-full bg-cream-100 text-cream-700 flex items-center justify-center mx-auto mb-6 text-2xl">🌾</div>
          <h3 className="text-xl font-bold text-forest-950">No active residue listings</h3>
          <p className="text-sm text-forest-700 max-w-sm mx-auto mt-2">
            Earn money from crop stubble rather than burning it. AI valuations take less than a minute.
          </p>
          <button
            onClick={onNavigateToSell}
            className="mt-6 bg-forest-600 hover:bg-forest-700 text-white font-bold px-6 py-3 rounded-xl transition-all"
          >
            Create Your First Listing
          </button>
        </div>
      )}

      {/* Buyer Matches */}
      {rameshListing && rameshListing.status === 'Listed' && (
        <div className="bg-white border border-forest-100 rounded-3xl p-6 shadow-sm">
          <h4 className="font-extrabold text-base text-forest-950 mb-4 flex items-center gap-2">
            <span>🤖</span> AI-Matched Buyers Interested
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-forest-100 p-5 rounded-2xl hover:border-forest-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h5 className="font-bold text-sm text-forest-950">GreenGrow Mushroom Farm</h5>
                  <span className="text-[10px] font-extrabold bg-forest-100 text-forest-800 px-2 py-0.5 rounded-full">
                    94% Match
                  </span>
                </div>
                <p className="text-xs text-forest-600 mt-2">Rajpura, Punjab • 18 km away</p>
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-50">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Offer Price</span>
                    <span className="text-sm font-extrabold text-forest-850">₹1,200 / Tonne</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Pickup Date</span>
                    <span className="text-sm font-extrabold text-slate-800">22 Aug 2026</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => useAppStore.getState().acceptMatch(rameshListing.id)}
                className="mt-5 w-full bg-forest-50 hover:bg-forest-100 text-forest-800 text-xs font-bold py-2 rounded-lg border border-forest-200 transition-all"
              >
                Accept Offer
              </button>
            </div>

            <div className="border border-slate-100 p-5 rounded-2xl opacity-60 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h5 className="font-bold text-sm text-slate-800">EcoFiber Paper Mills</h5>
                  <span className="text-[10px] font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    89% Match
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Ludhiana Outer • 43 km away</p>
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-50">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Offer Price</span>
                    <span className="text-sm font-bold text-slate-700">₹1,150 / Tonne</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Pickup Date</span>
                    <span className="text-sm font-bold text-slate-700">24 Aug 2026</span>
                  </div>
                </div>
              </div>
              <button disabled className="mt-5 w-full bg-slate-50 text-slate-400 text-xs font-bold py-2 rounded-lg border border-slate-100 cursor-not-allowed">
                Accept Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
