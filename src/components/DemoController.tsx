import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { ArrowLeft, ArrowRight, RefreshCw, Layers } from 'lucide-react';

export const DemoController: React.FC = () => {
  const { demoStep, setDemoStep, nextDemoStep, prevDemoStep, resetDemo } = useAppStore();

  const steps = [
    { title: '1. Farmer Login', desc: 'Ramesh (Farmer) accesses Parali from his phone.' },
    { title: '2. List Residue', desc: 'Ramesh inputs 3 tonnes of wheat straw. AI gives value.' },
    { title: '3. AI Matches', desc: 'AI pairs Ramesh with GreenGrow Farm (94% match).' },
    { title: '4. Buyer Accepts', desc: 'Switch to Buyer panel. GreenGrow accepts match.' },
    { title: '5. Route Optimizer', desc: 'Run vehicle routes for 14 local farms. View savings.' },
    { title: '6. Live Tracking', desc: 'Track collection truck moving along optimized route.' },
    { title: '7. Payout Release', desc: 'Residue pickup completes. ₹2,400 paid to Ramesh.' },
    { title: '8. Global Impact', desc: 'Check dynamic stats of emissions & burning prevented.' },
    { title: '9. Fire Intelligence', desc: 'View satellite-detected crop fire hotspots & solutions.' }
  ];

  const current = steps[demoStep - 1];

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white/95 backdrop-blur border-2 border-clay-300 rounded-2xl shadow-2xl p-4 transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
        <div className="flex items-center gap-1.5 text-clay-800">
          <Layers className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">SIH Demo Controller</span>
        </div>
        <button 
          onClick={resetDemo} 
          className="text-xs flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors"
          title="Reset flow"
        >
          <RefreshCw className="h-3 w-3" /> Reset
        </button>
      </div>

      <div className="mb-3">
        <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
          {current.title}
        </h4>
        <p className="text-xs text-slate-600 mt-1 leading-normal">
          {current.desc}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 mt-4 pt-2 border-t border-slate-50">
        <button
          onClick={prevDemoStep}
          disabled={demoStep === 1}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <span className="text-xs font-extrabold text-slate-600 px-2">
          {demoStep} / {steps.length}
        </span>
        <button
          onClick={nextDemoStep}
          disabled={demoStep === steps.length}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 rounded-lg bg-forest-600 text-white hover:bg-forest-700 disabled:opacity-40 transition-all"
        >
          Next <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Direct step jumps */}
      <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-slate-50">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setDemoStep(i + 1)}
            className={`w-7 h-6 text-[10px] font-bold rounded flex items-center justify-center transition-all ${
              demoStep === i + 1
                ? 'bg-clay-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};
