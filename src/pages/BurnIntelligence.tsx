import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MapViewer } from '../components/MapViewer';
import { Flame, ShieldAlert, Award, Compass, Search } from 'lucide-react';

export const BurnIntelligence: React.FC = () => {
  const { hotspots } = useAppStore();
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>('h1');

  const activeHotspot = hotspots.find(h => h.id === selectedHotspotId) || hotspots[0];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-forest-950">Crop Burning Intelligence</h2>
          <p className="text-sm text-forest-700 mt-1">
            Real-time crop burning fire detections via thermal satellite sensors mapped against commercial alternatives.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Map Display */}
        <div className="lg:col-span-7 bg-white border border-forest-100 p-2 rounded-3xl shadow-sm">
          <MapViewer 
            showHotspots={true} 
            showRoutes={false}
            onHotspotClick={(hotspotId) => setSelectedHotspotId(hotspotId)}
          />
        </div>

        {/* Right Details Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Active stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-forest-100 p-4 rounded-xl shadow-sm">
              <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Active Hotspots</span>
              <span className="text-lg font-black text-clay-800 mt-1.5 inline-block">127 points</span>
            </div>
            <div className="bg-white border border-forest-100 p-4 rounded-xl shadow-sm">
              <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">High-Risk Farms</span>
              <span className="text-lg font-black text-slate-800 mt-1.5 inline-block">842 farms</span>
            </div>
            <div className="bg-white border border-forest-100 p-4 rounded-xl shadow-sm">
              <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Diverted Volume</span>
              <span className="text-lg font-black text-forest-800 mt-1.5 inline-block">184 tonnes</span>
            </div>
          </div>

          {/* Hotspot details card */}
          {activeHotspot ? (
            <div className="bg-white border-2 border-clay-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-clay-50 rounded-full filter blur-2xl opacity-40"></div>
              
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-5 w-5 text-clay-650 animate-pulse" />
                <span className="text-[10px] bg-clay-100 text-clay-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Crop Fire Detected
                </span>
              </div>

              <h4 className="font-extrabold text-base text-slate-900 leading-tight">
                {activeHotspot.location}
              </h4>
              <p className="text-xs text-slate-500 mt-1">Detected at: {activeHotspot.detectedAt}</p>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-50">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Thermal Confidence</span>
                  <span className="text-sm font-black text-slate-850">{activeHotspot.confidence}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Nearby Farms</span>
                  <span className="text-sm font-black text-slate-850">{activeHotspot.nearbyFarmsCount} holdings</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Estimated Biomass</span>
                  <span className="text-sm font-extrabold text-forest-850">{activeHotspot.potentialResidue} tonnes</span>
                </div>
              </div>

              <div className="mt-8">
                <button className="w-full bg-forest-600 hover:bg-forest-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5">
                  <Compass className="h-4 w-4" /> Find nearby Parali alternatives
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-forest-100 p-8 rounded-3xl text-center text-slate-500 font-semibold shadow-sm">
              Select a hotspot on the map to evaluate regional bio-energy diversion options.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
