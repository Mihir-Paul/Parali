import React, { useState, useMemo } from 'react';
import { Flame, DollarSign, Sprout, ArrowRight, Info, HelpCircle, ShieldAlert, CheckCircle } from 'lucide-react';
import { calculateLocalHiddenCost, AGRONOMIC_NUTRIENT_LOSS_MAP } from '../services/impactService';

interface FarmerHiddenCostCalculatorProps {
  initialResidueType?: string;
  initialQuantity?: number;
  initialPrice?: number;
  className?: string;
}

export const FarmerHiddenCostCalculator: React.FC<FarmerHiddenCostCalculatorProps> = ({
  initialResidueType = 'Rice Straw',
  initialQuantity = 5.0,
  initialPrice = 1200,
  className = ''
}) => {
  const [residueType, setResidueType] = useState<string>(initialResidueType);
  const [quantityTonnes, setQuantityTonnes] = useState<number>(initialQuantity);
  const [pricePerTonne, setPricePerTonne] = useState<number>(initialPrice);
  const [showHowCalculated, setShowHowCalculated] = useState<boolean>(false);

  const calcResult = useMemo(() => {
    return calculateLocalHiddenCost(residueType, quantityTonnes, pricePerTonne);
  }, [residueType, quantityTonnes, pricePerTonne]);

  const activeFactors = AGRONOMIC_NUTRIENT_LOSS_MAP[residueType] || AGRONOMIC_NUTRIENT_LOSS_MAP['default'];

  return (
    <div className={`bg-white border border-forest-100 rounded-3xl p-6 md:p-8 shadow-sm font-sans ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-forest-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              Agronomic Economics
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700">
              PAU / ICAR Benchmark Model
            </span>
          </div>
          <h3 className="text-2xl font-black text-forest-950 mt-2">Burn or Sell? See the Real Difference</h3>
          <p className="text-xs text-forest-700 mt-1 max-w-2xl">
            Calculate your true net financial advantage by selling crop residue through Parali versus burning it in-field.
          </p>
        </div>

        <button
          onClick={() => setShowHowCalculated(!showHowCalculated)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 hover:text-forest-900 bg-forest-50 hover:bg-forest-100 px-3 py-2 rounded-xl transition-all self-start md:self-auto"
        >
          <HelpCircle className="h-4 w-4 text-forest-600" />
          {showHowCalculated ? 'Hide Methodology' : 'How Calculated?'}
        </button>
      </div>

      {/* Expandable How Calculated Methodology Box */}
      {showHowCalculated && (
        <div className="mb-8 p-5 bg-forest-900 text-cream-50 rounded-2xl text-xs space-y-3 shadow-inner border border-forest-800">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold uppercase tracking-wider text-cream-100 text-xs">Methodology & Formula Breakdown</h4>
            <span className="text-[10px] bg-forest-800 text-clay-300 font-bold px-2 py-0.5 rounded-full">Transparent Math</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            When residue is burned, nitrogen (N), phosphorus (P), potassium (K), sulfur (S), and organic carbon are lost to the atmosphere, requiring extra chemical fertilizer purchases for the next crop cycle.
          </p>
          <div className="grid md:grid-cols-3 gap-3 pt-2 text-[11px]">
            <div className="bg-forest-950/60 p-3 rounded-xl border border-forest-800/60">
              <strong className="block text-cream-100 font-bold">1. In-Field Soil Nutrient Loss</strong>
              <span className="text-slate-300 block mt-1">Quantity (t) × Configured Agronomic Loss (₹{activeFactors.npkLossPerTonne}/t)</span>
            </div>
            <div className="bg-forest-950/60 p-3 rounded-xl border border-forest-800/60">
              <strong className="block text-cream-100 font-bold">2. Parali Residue Revenue</strong>
              <span className="text-slate-300 block mt-1">Quantity (t) × Market Sale Price (₹{pricePerTonne}/t)</span>
            </div>
            <div className="bg-forest-950/60 p-3 rounded-xl border border-forest-800/60">
              <strong className="block text-cream-100 font-bold">3. Total Net Advantage</strong>
              <span className="text-slate-300 block mt-1">Parali Revenue + Avoided Soil Nutrient Loss</span>
            </div>
          </div>
        </div>
      )}

      {/* Input Sliders & Controls */}
      <div className="grid md:grid-cols-3 gap-6 mb-8 p-6 bg-forest-50/50 rounded-2xl border border-forest-100">
        {/* Input 1: Residue Type */}
        <div>
          <label className="text-xs font-extrabold text-forest-900 block mb-2 uppercase tracking-wide">
            Crop Residue Type
          </label>
          <select
            value={residueType}
            onChange={(e) => setResidueType(e.target.value)}
            className="w-full text-xs font-bold text-slate-800 bg-white border border-forest-200 rounded-xl px-3 py-2.5 shadow-xs focus:outline-none focus:ring-2 focus:ring-forest-600 cursor-pointer"
          >
            <option value="Rice Straw">Rice Straw (Paddy)</option>
            <option value="Wheat Straw">Wheat Straw</option>
            <option value="Cotton Stalks">Cotton Stalks</option>
            <option value="Mustard Stalks">Mustard Stalks</option>
            <option value="Sugarcane Trash">Sugarcane Trash</option>
          </select>
          <span className="text-[10px] text-slate-500 font-semibold block mt-1.5">
            Est. soil loss: ₹{activeFactors.npkLossPerTonne}/tonne
          </span>
        </div>

        {/* Input 2: Quantity Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-extrabold text-forest-900 uppercase tracking-wide">
              Residue Quantity
            </label>
            <span className="text-xs font-black text-forest-800 bg-white px-2 py-0.5 rounded-lg border border-forest-200">
              {quantityTonnes.toFixed(1)} tonnes
            </span>
          </div>
          <input
            type="range"
            min={1.0}
            max={30.0}
            step={0.5}
            value={quantityTonnes}
            onChange={(e) => setQuantityTonnes(Number(e.target.value))}
            className="w-full accent-forest-700 cursor-pointer h-2 bg-forest-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
            <span>1 Tonne</span>
            <span>15 Tonnes</span>
            <span>30 Tonnes</span>
          </div>
        </div>

        {/* Input 3: Price Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-extrabold text-forest-900 uppercase tracking-wide">
              Expected Selling Price
            </label>
            <span className="text-xs font-black text-forest-800 bg-white px-2 py-0.5 rounded-lg border border-forest-200">
              ₹{pricePerTonne.toLocaleString('en-IN')}/tonne
            </span>
          </div>
          <input
            type="range"
            min={800}
            max={2500}
            step={50}
            value={pricePerTonne}
            onChange={(e) => setPricePerTonne(Number(e.target.value))}
            className="w-full accent-forest-700 cursor-pointer h-2 bg-forest-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
            <span>₹800/t</span>
            <span>₹1,600/t</span>
            <span>₹2,500/t</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Scenario Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Scenario A: BURNING */}
        <div className="bg-red-50/60 border-2 border-red-200 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-300 uppercase">
                <Flame className="h-3.5 w-3.5 text-red-600" />
                Scenario A: In-Field Burning
              </span>
              <span className="text-[10px] font-bold text-red-700">Financial Loss</span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-red-200/60">
                <span className="font-semibold text-slate-700">Residue Selling Income</span>
                <span className="font-extrabold text-slate-900">₹0</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-red-200/60">
                <span className="font-semibold text-slate-700">Soil N-P-K Nutrient Loss</span>
                <span className="font-extrabold text-red-700">-₹{calcResult.burning_scenario.estimated_nutrient_loss_inr.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-red-200/60">
                <span className="font-semibold text-slate-700">Organic Carbon Destroyed</span>
                <span className="font-bold text-slate-700">~{calcResult.burning_scenario.estimated_carbon_loss_kg} kg</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-red-200">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-bold text-red-800 uppercase block">Net Outcome (Burning)</span>
                <span className="text-xl font-black text-red-700">
                  -₹{calcResult.burning_scenario.estimated_nutrient_loss_inr.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-[10px] text-red-600 font-bold bg-red-100 px-2 py-1 rounded">Depletes Soil</span>
            </div>
          </div>
        </div>

        {/* Scenario B: SELLING VIA PARALI */}
        <div className="bg-emerald-50/60 border-2 border-emerald-200 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                Scenario B: Sell via Parali
              </span>
              <span className="text-[10px] font-bold text-emerald-700">Net Financial Gain</span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-emerald-200/60">
                <span className="font-semibold text-slate-700">Gross Residue Payout</span>
                <span className="font-black text-emerald-800">+₹{calcResult.selling_scenario.gross_income_inr.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-emerald-200/60">
                <span className="font-semibold text-slate-700">Soil N-P-K Nutrients Retained</span>
                <span className="font-extrabold text-emerald-700">+₹{calcResult.burning_scenario.estimated_nutrient_loss_inr.toLocaleString('en-IN')} saved</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-emerald-200/60">
                <span className="font-semibold text-slate-700">Farmgate Pickup Transport</span>
                <span className="font-bold text-emerald-700">Managed (₹0)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-200">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Net Outcome (Selling)</span>
                <span className="text-xl font-black text-emerald-800">
                  +₹{calcResult.selling_scenario.gross_income_inr.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-1 rounded">Guaranteed Income</span>
            </div>
          </div>
        </div>
      </div>

      {/* Final Verdict Banner */}
      <div className="p-6 bg-gradient-to-r from-forest-900 via-forest-850 to-forest-900 text-white rounded-2xl shadow-md border border-forest-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-forest-800 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-inner">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-clay-300 font-extrabold uppercase tracking-widest block">Net Economic Advantage</span>
            <h4 className="text-lg md:text-xl font-black text-cream-100">
              {calcResult.verdict_headline}
            </h4>
          </div>
        </div>

        <div className="text-right self-stretch md:self-auto flex md:flex-col justify-between items-end border-t md:border-t-0 border-forest-700 pt-3 md:pt-0">
          <span className="text-[10px] text-slate-300 font-bold block uppercase">Total Value Unlocked</span>
          <span className="text-2xl font-black text-amber-300">
            ₹{calcResult.comparative_advantage_inr.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Footnote / Disclaimer */}
      <div className="mt-4 text-center text-[11px] text-slate-500 font-medium">
        {calcResult.disclaimer} Illustrative estimate based on configured agronomic assumptions.
      </div>
    </div>
  );
};
