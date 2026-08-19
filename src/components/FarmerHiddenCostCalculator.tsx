import React, { useState, useMemo } from 'react';
import { Flame, Sprout, HelpCircle, CheckCircle } from 'lucide-react';
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
    <div className={`bg-surface-0 border border-line-200 rounded-card p-6 md:p-8 shadow-card font-sans ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-line-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-card text-[10px] font-mono font-medium uppercase tracking-wide bg-pine-100 text-pine-700">
              Agronomic economics
            </span>
            <span className="px-2 py-0.5 rounded-card text-[10px] font-mono text-ink-500 bg-paper-50 border border-line-200">
              PAU / ICAR benchmark model
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-display font-bold text-ink-900 mt-2">Burn or sell? See the real difference</h3>
          <p className="text-xs text-ink-500 mt-1 max-w-2xl">
            Calculate your true net financial advantage by selling crop residue through Parali versus burning it in-field.
          </p>
        </div>

        <button
          onClick={() => setShowHowCalculated(!showHowCalculated)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-900 hover:bg-paper-50 border border-line-200 px-3 py-1.5 rounded-card transition-all self-start md:self-auto"
        >
          <HelpCircle className="h-4 w-4 text-ink-500" />
          {showHowCalculated ? 'Hide methodology' : 'How calculated?'}
        </button>
      </div>

      {/* Expandable How Calculated Methodology Box */}
      {showHowCalculated && (
        <div className="mb-6 p-4 bg-pine-900 text-white rounded-card text-xs space-y-3 border border-pine-700">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-semibold uppercase tracking-wide text-paper-50 text-xs">Methodology & formula breakdown</h4>
            <span className="text-[10px] font-mono bg-pine-700 text-pine-100 px-2 py-0.5 rounded-card">Transparent math</span>
          </div>
          <p className="text-pine-100 leading-relaxed text-xs">
            When residue is burned, nitrogen (N), phosphorus (P), potassium (K), sulfur (S), and organic carbon are lost to the atmosphere, requiring extra chemical fertilizer purchases for the next crop cycle.
          </p>
          <div className="grid md:grid-cols-3 gap-3 pt-1 text-[11px]">
            <div className="bg-pine-900 p-3 rounded-card border border-pine-700">
              <strong className="block text-white font-medium">1. In-field soil nutrient loss</strong>
              <span className="text-pine-100 font-mono block mt-1">Quantity (t) × Loss factor (₹{activeFactors.npkLossPerTonne}/t)</span>
            </div>
            <div className="bg-pine-900 p-3 rounded-card border border-pine-700">
              <strong className="block text-white font-medium">2. Parali residue revenue</strong>
              <span className="text-pine-100 font-mono block mt-1">Quantity (t) × Sale price (₹{pricePerTonne}/t)</span>
            </div>
            <div className="bg-pine-900 p-3 rounded-card border border-pine-700">
              <strong className="block text-white font-medium">3. Total net advantage</strong>
              <span className="text-pine-100 font-mono block mt-1">Parali revenue + Avoided soil loss</span>
            </div>
          </div>
        </div>
      )}

      {/* Input Sliders & Controls */}
      <div className="grid md:grid-cols-3 gap-6 mb-6 p-5 bg-paper-50 rounded-card border border-line-200">
        {/* Input 1: Residue Type */}
        <div>
          <label className="text-xs font-medium text-ink-900 block mb-2 uppercase tracking-wide">
            Crop residue type
          </label>
          <select
            value={residueType}
            onChange={(e) => setResidueType(e.target.value)}
            className="w-full text-xs font-medium text-ink-900 bg-surface-0 border border-line-200 rounded-card px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pine-700 cursor-pointer"
          >
            <option value="Rice Straw">Rice Straw (Paddy)</option>
            <option value="Wheat Straw">Wheat Straw</option>
            <option value="Cotton Stalks">Cotton Stalks</option>
            <option value="Mustard Stalks">Mustard Stalks</option>
            <option value="Sugarcane Trash">Sugarcane Trash</option>
          </select>
          <span className="text-[10px] text-ink-500 font-mono block mt-1.5">
            Est. soil loss: ₹{activeFactors.npkLossPerTonne}/tonne
          </span>
        </div>

        {/* Input 2: Quantity Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium text-ink-900 uppercase tracking-wide">
              Residue quantity
            </label>
            <span className="text-xs font-mono font-semibold text-ink-900 bg-surface-0 px-2 py-0.5 rounded-card border border-line-200">
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
            className="w-full accent-pine-700 cursor-pointer h-2 bg-line-200 rounded-card"
          />
          <div className="flex justify-between text-[10px] text-ink-500 font-mono mt-1">
            <span>1 t</span>
            <span>15 t</span>
            <span>30 t</span>
          </div>
        </div>

        {/* Input 3: Price Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium text-ink-900 uppercase tracking-wide">
              Expected selling price
            </label>
            <span className="text-xs font-mono font-semibold text-ink-900 bg-surface-0 px-2 py-0.5 rounded-card border border-line-200">
              ₹{pricePerTonne.toLocaleString('en-IN')}/t
            </span>
          </div>
          <input
            type="range"
            min={800}
            max={2500}
            step={50}
            value={pricePerTonne}
            onChange={(e) => setPricePerTonne(Number(e.target.value))}
            className="w-full accent-pine-700 cursor-pointer h-2 bg-line-200 rounded-card"
          />
          <div className="flex justify-between text-[10px] text-ink-500 font-mono mt-1">
            <span>₹800/t</span>
            <span>₹1,600/t</span>
            <span>₹2,500/t</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Scenario Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Scenario A: BURNING */}
        <div className="bg-surface-0 border border-ember-600/30 rounded-card p-5 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-card text-[10px] font-semibold bg-ember-600/10 text-ember-600 border border-ember-600/20 uppercase">
                <Flame className="h-3.5 w-3.5 text-ember-600" />
                Scenario A: In-field burning
              </span>
              <span className="text-[10px] font-medium text-ember-600">Financial loss</span>
            </div>

            <div className="space-y-2.5 mb-5">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-line-200">
                <span className="text-ink-500 font-medium">Residue selling income</span>
                <span className="font-mono font-semibold text-ink-900">₹0</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-line-200">
                <span className="text-ink-500 font-medium">Soil N-P-K nutrient loss</span>
                <span className="font-mono font-semibold text-ember-600">-₹{calcResult.burning_scenario.estimated_nutrient_loss_inr.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-line-200">
                <span className="text-ink-500 font-medium">Organic carbon destroyed</span>
                <span className="font-mono text-ink-900">~{calcResult.burning_scenario.estimated_carbon_loss_kg} kg</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-line-200">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-medium text-ink-500 uppercase block">Net outcome (burning)</span>
                <span className="text-lg font-display font-bold font-mono text-ember-600">
                  -₹{calcResult.burning_scenario.estimated_nutrient_loss_inr.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-[10px] text-ember-600 font-medium bg-ember-600/10 px-2 py-0.5 rounded-card">Depletes soil</span>
            </div>
          </div>
        </div>

        {/* Scenario B: SELLING VIA PARALI */}
        <div className="bg-surface-0 border border-pine-700/30 rounded-card p-5 relative flex flex-col justify-between shadow-card">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-card text-[10px] font-semibold bg-pine-100 text-pine-700 border border-pine-700/20 uppercase">
                <CheckCircle className="h-3.5 w-3.5 text-pine-700" />
                Scenario B: Sell via Parali
              </span>
              <span className="text-[10px] font-medium text-pine-700">Net financial gain</span>
            </div>

            <div className="space-y-2.5 mb-5">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-line-200">
                <span className="text-ink-500 font-medium">Gross residue payout</span>
                <span className="font-mono font-semibold text-pine-700">+₹{calcResult.selling_scenario.gross_income_inr.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-line-200">
                <span className="text-ink-500 font-medium">Soil N-P-K nutrients retained</span>
                <span className="font-mono text-pine-700">+₹{calcResult.burning_scenario.estimated_nutrient_loss_inr.toLocaleString('en-IN')} saved</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-line-200">
                <span className="text-ink-500 font-medium">Farmgate pickup transport</span>
                <span className="font-medium text-pine-700">Managed (₹0)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-line-200">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-medium text-ink-500 uppercase block">Net outcome (selling)</span>
                <span className="text-lg font-display font-bold font-mono text-pine-700">
                  +₹{calcResult.selling_scenario.gross_income_inr.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-[10px] text-pine-700 font-medium bg-pine-100 px-2 py-0.5 rounded-card">Guaranteed income</span>
            </div>
          </div>
        </div>
      </div>

      {/* Final Verdict Banner */}
      <div className="p-5 bg-pine-900 text-white rounded-card shadow-card border border-pine-700 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-card bg-pine-700 flex items-center justify-center text-pine-100 shrink-0">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-pine-100 font-mono uppercase tracking-wider block">Net economic advantage</span>
            <h4 className="text-base md:text-lg font-display font-bold text-white">
              {calcResult.verdict_headline}
            </h4>
          </div>
        </div>

        <div className="text-right self-stretch md:self-auto flex md:flex-col justify-between items-end border-t md:border-t-0 border-pine-700 pt-3 md:pt-0">
          <span className="text-[10px] text-pine-100 font-mono uppercase block">Total value unlocked</span>
          <span className="text-xl font-display font-bold font-mono text-ash-500">
            ₹{calcResult.comparative_advantage_inr.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Footnote / Disclaimer */}
      <div className="mt-3 text-center text-[10px] text-ink-500 font-normal">
        {calcResult.disclaimer} Illustrative estimate based on configured agronomic assumptions.
      </div>
    </div>
  );
};
