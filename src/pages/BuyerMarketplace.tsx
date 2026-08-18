import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MapViewer } from '../components/MapViewer';
import { Sprout, Filter, Map, List, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface BuyerMarketplaceProps {
  onBack: () => void;
}

export const BuyerMarketplace: React.FC<BuyerMarketplaceProps> = ({ onBack }) => {
  const { listings, confirmBuyerRequirement, demoStep } = useAppStore();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [cropFilter, setCropFilter] = useState<string>('All');
  const [highlightedFarmId, setHighlightedFarmId] = useState<string | undefined>(undefined);

  const filteredListings = listings.filter(l => {
    if (cropFilter === 'All') return true;
    return l.cropType === cropFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans">
      <button 
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-forest-800 hover:text-forest-950 font-bold mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-forest-950">Residue Marketplace</h2>
          <p className="text-sm text-forest-700 mt-1">
            Browse and source crop residue directly from farmers in the region.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
          <button 
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
              viewMode === 'list' ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="h-3.5 w-3.5" /> List
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
              viewMode === 'map' ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Map className="h-3.5 w-3.5" /> Map
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left column Filters & Listings */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Filters Bar */}
          <div className="bg-white border border-forest-100 p-4 rounded-2xl shadow-sm flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-forest-900 mr-2">
              <Filter className="h-4 w-4" /> Filter Crop:
            </div>
            {['All', 'Wheat', 'Rice', 'Maize', 'Sugarcane'].map(c => (
              <button
                key={c}
                onClick={() => setCropFilter(c)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  cropFilter === c
                    ? 'bg-forest-600 border-forest-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Listings List */}
          {viewMode === 'list' ? (
            <div className="flex flex-col gap-4">
              {filteredListings.length === 0 ? (
                <div className="bg-white border border-forest-100 rounded-2xl p-10 text-center text-slate-500 font-semibold">
                  No matching crop residues found.
                </div>
              ) : (
                filteredListings.map(l => (
                  <div 
                    key={l.id} 
                    className="bg-white border border-forest-100 p-5 rounded-2xl shadow-sm hover:border-forest-300 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    onMouseEnter={() => setHighlightedFarmId(l.farmerId)}
                    onMouseLeave={() => setHighlightedFarmId(undefined)}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-forest-100 text-forest-800 font-extrabold px-2.5 py-0.5 rounded-full">
                          {l.cropType} Straw
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          Match Score: {l.matchScore || 85}%
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-forest-950 mt-2">
                        {l.quantity} tonnes in {l.pickupLocation}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">
                        Listed by {l.farmerName} • Scheduled pickup: {l.pickupDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-bold block">Estimated Price</span>
                        <span className="text-sm font-black text-forest-900">
                          ₹{l.estimatedPriceMin} - ₹{l.estimatedPriceMax}
                        </span>
                      </div>
                      
                      {l.status === 'Listed' || l.status === 'Matched' ? (
                        <button
                          onClick={() => confirmBuyerRequirement(l.id)}
                          className="bg-forest-600 hover:bg-forest-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-lg shadow-sm"
                        >
                          Accept
                        </button>
                      ) : (
                        <span className="text-[10px] text-forest-800 bg-forest-50 border border-forest-100 font-bold px-3 py-2 rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Confirmed
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="bg-white border border-forest-100 rounded-2xl p-2 shadow-sm">
              <MapViewer 
                showRoutes={false} 
                highlightedFarmId={highlightedFarmId}
                onFarmClick={(farmId) => setHighlightedFarmId(farmId)}
              />
            </div>
          )}
        </div>

        {/* Right column Map Preview & Stats */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-forest-900 text-cream-50 rounded-2xl p-6 shadow-md border border-forest-800">
            <span className="text-[10px] bg-forest-800 text-clay-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Market intelligence
            </span>
            <h4 className="font-extrabold text-sm text-cream-100 mt-4 uppercase">Regional Biomass Demand</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Residue prices are stable this week. Rice straw supply is expected to spike in October. Wheat straw continues to see high demand from local power cooperatives.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-forest-800">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Active Sellers</span>
                <span className="text-lg font-black text-white">42 Farmers</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Total Sourced</span>
                <span className="text-lg font-black text-white">1,940 tonnes</span>
              </div>
            </div>
          </div>

          {viewMode === 'list' && (
            <div className="bg-white border border-forest-100 rounded-2xl p-2 shadow-sm">
              <MapViewer 
                showRoutes={false} 
                highlightedFarmId={highlightedFarmId}
                onFarmClick={(farmId) => setHighlightedFarmId(farmId)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
