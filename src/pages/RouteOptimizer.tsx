import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { MapViewer } from '../components/MapViewer';
import { Compass, Truck, Play, RefreshCw, CheckCircle2, TrendingDown } from 'lucide-react';

export const RouteOptimizer: React.FC = () => {
  const { 
    isOptimizing, 
    optimizationProgress, 
    optimizationLogs, 
    routeOptimized, 
    runRouteOptimizer, 
    resetRouteOptimizer,
    demoStep
  } = useAppStore();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-forest-950">AI Route Optimizer</h2>
          <p className="text-sm text-forest-700 mt-1">
            Dynamic collection vehicle dispatching based on capacity constraints and sweep routing heuristics.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={resetRouteOptimizer}
            className="p-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-all flex items-center gap-1.5"
            disabled={isOptimizing}
          >
            <RefreshCw className="h-4 w-4" /> Reset
          </button>
          <button
            onClick={runRouteOptimizer}
            className="bg-forest-600 hover:bg-forest-700 text-white font-bold px-5 py-3 rounded-xl shadow-md transition-all text-xs flex items-center gap-1.5"
            disabled={isOptimizing}
          >
            <Play className="h-4 w-4" /> Run Route Optimization
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Control Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Collection Plan stats */}
          <div className="bg-white border border-forest-100 p-6 rounded-3xl shadow-sm">
            <h3 className="font-extrabold text-base text-forest-950 mb-4 flex items-center gap-1.5">
              <Compass className="h-5 w-5 text-forest-600" /> Collection Plan Summary
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-forest-50/50 p-4 rounded-xl border border-forest-100/30">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Farms Batched</span>
                <span className="text-xl font-black text-forest-900">14 Farms</span>
              </div>
              <div className="bg-forest-50/50 p-4 rounded-xl border border-forest-100/30">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Total Tonnage</span>
                <span className="text-xl font-black text-forest-900">47.8 Tonnes</span>
              </div>
              <div className="bg-forest-50/50 p-4 rounded-xl border border-forest-100/30">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Estimated Distance</span>
                <span className="text-xl font-black text-forest-900">82 km</span>
              </div>
              <div className="bg-forest-50/50 p-4 rounded-xl border border-forest-100/30">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Logistics Time</span>
                <span className="text-xl font-black text-forest-900">3h 42m</span>
              </div>
            </div>

            {/* Savings Highlights */}
            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logistics Cost Savings</h4>
              <div className="grid grid-cols-3 gap-2 mt-3 items-center">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block">Standard Cost</span>
                  <span className="text-xs font-bold text-slate-700">₹4,850</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block">AI Optimized</span>
                  <span className="text-xs font-bold text-forest-700">₹3,240</span>
                </div>
                <div className="bg-forest-100 text-forest-800 p-2.5 rounded-xl text-center">
                  <span className="text-[9px] font-bold block uppercase tracking-wider leading-none">Savings</span>
                  <span className="text-sm font-black mt-1 inline-block">₹1,610</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Console Log */}
          <div className="bg-[#242b27] text-slate-300 font-mono text-[10px] p-5 rounded-3xl h-[200px] overflow-y-auto flex flex-col gap-1.5 shadow-inner">
            <span className="text-slate-500 font-bold uppercase border-b border-slate-800 pb-1 mb-1 block">Parali AI Engine Console</span>
            
            {optimizationLogs.length === 0 && !isOptimizing && (
              <span className="text-slate-500">System idle. Click 'Run' to begin vehicle routing analysis.</span>
            )}
            
            {optimizationLogs.map((log, i) => (
              <span key={i} className="leading-relaxed">{log}</span>
            ))}
            
            {isOptimizing && (
              <div className="flex items-center gap-2 text-clay-400 font-bold mt-2">
                <span className="w-2 h-2 rounded-full bg-clay-500 animate-ping"></span>
                <span>Optimizing sequence... {optimizationProgress}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Right side Map visualization */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white border border-forest-100 p-2 rounded-3xl shadow-sm">
            <MapViewer showRoutes={true} />
          </div>
          
          <div className="bg-cream-100/50 border border-forest-100/40 p-4 rounded-2xl text-xs text-forest-850 font-medium">
            💡 <strong className="text-forest-900">Optimization Note:</strong> High residue compaction on Farm 2 and 3 allows dual-payload stacking, reducing truck return trips. The route begins at Punjab BioEnergy Plant and terminates at GreenGrow Mushroom Farm.
          </div>
        </div>
      </div>
    </div>
  );
};
