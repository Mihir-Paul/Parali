import React, { useState, useMemo } from 'react';
import { calculateLocalHiddenCost } from '../services/impactService';
import {
  Flame,
  CheckCircle,
  HelpCircle,
  Sprout
} from 'lucide-react';

interface FarmerHiddenCostCalculatorProps {
  initialCropType?: string;
  initialQuantity?: number;
  className?: string;
}

export const FarmerHiddenCostCalculator: React.FC<FarmerHiddenCostCalculatorProps> = ({
  initialCropType = 'Wheat Straw',
  initialQuantity = 5,
  className = ''
}) => {
  const [residueType, setResidueType] = useState<string>(initialCropType);
  const [quantityTonnes, setQuantityTonnes] = useState<number>(initialQuantity);
  const [pricePerTonne, setPricePerTonne] = useState<number>(1200);
  const [showHowCalculated, setShowHowCalculated] = useState<boolean>(false);

  const calcResult = useMemo(() => {
    return calculateLocalHiddenCost(residueType, quantityTonnes, pricePerTonne);
  }, [residueType, quantityTonnes, pricePerTonne]);

  return (
    <div className={`bg-white dark:bg-[#14251D] border border-[#D8E2DC] dark:border-[#294237] rounded-card p-6 md:p-8 shadow-card font-sans ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#D8E2DC] dark:border-[#294237]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#EAF3ED] dark:bg-[#183D2E] text-[#174C38] dark:text-[#8BC7A3] border border-[#D8E2DC] dark:border-[#294237]">
              Agronomic economics
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#40594D] dark:text-[#B8C8BF] bg-[#FAFAF7] dark:bg-[#1C3429] border border-[#D8E2DC] dark:border-[#294237]">
              PAU / ICAR benchmark model
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-display font-black text-[#102F24] dark:text-[#F1F5F2] mt-2">Burn or sell? See the real difference</h3>
          <p className="text-xs text-[#40594D] dark:text-[#B8C8BF] mt-1 max-w-2xl">
            Calculate your true net financial advantage by selling crop residue through Parali versus burning it in-field.
          </p>
        </div>

        <button
          onClick={() => setShowHowCalculated(!showHowCalculated)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#102F24] dark:text-[#F1F5F2] bg-[#F1F6F3] dark:bg-[#183328] hover:bg-[#EAF3ED] dark:hover:bg-[#1C3429] border border-[#D8E2DC] dark:border-[#294237] px-3.5 py-2 rounded-xl transition-all self-start md:self-auto"
        >
          <HelpCircle className="h-4 w-4 text-[#2F6B4F] dark:text-[#8BC7A3]" />
          {showHowCalculated ? 'Hide methodology' : 'How calculated?'}
        </button>
      </div>

      {/* Expandable How Calculated Methodology Box */}
      {showHowCalculated && (
        <div className="mb-6 p-5 bg-[#F1F6F3] dark:bg-[#183328] text-[#102F24] dark:text-[#F1F5F2] rounded-2xl text-xs space-y-3 border border-[#D8E2DC] dark:border-[#294237]">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-extrabold uppercase tracking-wider text-[#102F24] dark:text-[#F1F5F2] text-xs">Methodology &amp; formula breakdown</h4>
            <span className="text-[10px] font-mono bg-[#EAF3ED] dark:bg-[#101F18] text-[#174C38] dark:text-[#8BC7A3] px-2.5 py-0.5 rounded-full font-bold">Transparent math</span>
          </div>
          <p className="text-[#40594D] dark:text-[#B8C8BF] leading-relaxed text-xs">
            When residue is burned, nitrogen (N), phosphorus (P), potassium (K), sulfur (S), and organic carbon are lost to the atmosphere, requiring extra chemical fertilizer purchases for the next crop cycle.
          </p>
          <div className="grid md:grid-cols-3 gap-3 pt-1 text-[11px]">
            <div className="bg-white dark:bg-[#14251D] p-3.5 rounded-xl border border-[#D8E2DC] dark:border-[#294237]">
              <strong className="block text-[#102F24] dark:text-[#F1F5F2] font-bold">1. In-field soil nutrient loss</strong>
              <span className="text-[#40594D] dark:text-[#B8C8BF] block mt-0.5">₹850 – ₹950 per tonne based on Punjab Agricultural University (PAU) trials.</span>
            </div>
            <div className="bg-white dark:bg-[#14251D] p-3.5 rounded-xl border border-[#D8E2DC] dark:border-[#294237]">
              <strong className="block text-[#102F24] dark:text-[#F1F5F2] font-bold">2. Organic carbon loss</strong>
              <span className="text-[#40594D] dark:text-[#B8C8BF] block mt-0.5">350 – 450 kg of organic soil carbon vaporized per tonne of straw burned.</span>
            </div>
            <div className="bg-white dark:bg-[#14251D] p-3.5 rounded-xl border border-[#D8E2DC] dark:border-[#294237]">
              <strong className="block text-[#102F24] dark:text-[#F1F5F2] font-bold">3. Net comparative gain</strong>
              <span className="text-[#40594D] dark:text-[#B8C8BF] block mt-0.5">Net Gain = (Residue Revenue) + (Nutrients Preserved in Soil).</span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Sliders & Inputs */}
      <div className="grid md:grid-cols-3 gap-6 mb-8 p-5 bg-[#FAFAF7] dark:bg-[#183328] rounded-2xl border border-[#D8E2DC] dark:border-[#294237]">
        {/* Input 1: Crop Residue Type */}
        <div>
          <label className="block text-xs font-extrabold text-[#102F24] dark:text-[#F1F5F2] uppercase tracking-wider mb-2">
            Residue type
          </label>
          <select
            value={residueType}
            onChange={(e) => setResidueType(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-[#D8E2DC] dark:border-[#294237] bg-white dark:bg-[#14251D] text-[#102F24] dark:text-[#F1F5F2] font-bold outline-none focus:ring-2 focus:ring-[#6FAF8A]"
          >
            <option value="Rice Straw">Rice / Paddy straw</option>
            <option value="Wheat Straw">Wheat straw</option>
            <option value="Cotton Stalks">Cotton stalks</option>
            <option value="Mustard Stalks">Mustard stalks</option>
            <option value="Sugarcane Trash">Sugarcane trash</option>
          </select>
        </div>

        {/* Input 2: Quantity Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-extrabold text-[#102F24] dark:text-[#F1F5F2] uppercase tracking-wider">
              Est. season quantity
            </label>
            <span className="text-xs font-mono font-bold text-[#102F24] dark:text-[#F1F5F2] bg-white dark:bg-[#14251D] px-2.5 py-0.5 rounded-lg border border-[#D8E2DC] dark:border-[#294237]">
              {quantityTonnes} tonnes
            </span>
          </div>
          <input
            type="range"
            min={1.0}
            max={30.0}
            step={0.5}
            value={quantityTonnes}
            onChange={(e) => setQuantityTonnes(Number(e.target.value))}
            className="w-full accent-[#174C38] dark:accent-[#8BC7A3] cursor-pointer h-2 bg-[#D8E2DC] dark:bg-[#294237] rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-[#687B72] dark:text-[#8FA69A] font-mono mt-1 font-bold">
            <span>1 t</span>
            <span>15 t</span>
            <span>30 t</span>
          </div>
        </div>

        {/* Input 3: Price Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-extrabold text-[#102F24] dark:text-[#F1F5F2] uppercase tracking-wider">
              Expected selling price
            </label>
            <span className="text-xs font-mono font-bold text-[#102F24] dark:text-[#F1F5F2] bg-white dark:bg-[#14251D] px-2.5 py-0.5 rounded-lg border border-[#D8E2DC] dark:border-[#294237]">
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
            className="w-full accent-[#174C38] dark:accent-[#8BC7A3] cursor-pointer h-2 bg-[#D8E2DC] dark:bg-[#294237] rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-[#687B72] dark:text-[#8FA69A] font-mono mt-1 font-bold">
            <span>₹800/t</span>
            <span>₹1,600/t</span>
            <span>₹2,500/t</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Scenario Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Scenario A: BURNING */}
        <div className="bg-[#FEF3F2] dark:bg-[#2A1D1A] border border-[#FECDCA] dark:border-[#5C2D24] rounded-2xl p-5 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white dark:bg-[#101F18] text-[#B84A3A] dark:text-[#E2903F] border border-[#FECDCA] dark:border-[#5C2D24] uppercase tracking-wider">
                <Flame className="h-3.5 w-3.5 text-[#B84A3A] dark:text-[#E2903F]" />
                Scenario A: In-field burning
              </span>
              <span className="text-[10px] font-bold text-[#B84A3A] dark:text-[#E2903F]">Financial loss</span>
            </div>

            <div className="space-y-2.5 mb-5">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-[#FECDCA]/60 dark:border-[#5C2D24]">
                <span className="text-[#40594D] dark:text-[#B8C8BF] font-medium">Residue selling income</span>
                <span className="font-mono font-bold text-[#102F24] dark:text-[#F1F5F2]">₹0</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-[#FECDCA]/60 dark:border-[#5C2D24]">
                <span className="text-[#40594D] dark:text-[#B8C8BF] font-medium">Soil N-P-K nutrient loss</span>
                <span className="font-mono font-bold text-[#B84A3A] dark:text-[#E2903F]">-₹{calcResult.burning_scenario.estimated_nutrient_loss_inr.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-[#FECDCA]/60 dark:border-[#5C2D24]">
                <span className="text-[#40594D] dark:text-[#B8C8BF] font-medium">Organic carbon destroyed</span>
                <span className="font-mono font-bold text-[#102F24] dark:text-[#F1F5F2]">~{calcResult.burning_scenario.estimated_carbon_loss_kg} kg</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#FECDCA] dark:border-[#5C2D24]">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-bold text-[#687B72] dark:text-[#8FA69A] uppercase block">Net outcome (burning)</span>
                <span className="text-lg font-display font-black font-mono text-[#B84A3A] dark:text-[#E2903F]">
                  -₹{calcResult.burning_scenario.estimated_nutrient_loss_inr.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-[10px] text-[#B84A3A] dark:text-[#E2903F] font-extrabold bg-white dark:bg-[#101F18] px-2.5 py-0.5 rounded-md border border-[#FECDCA] dark:border-[#5C2D24]">Depletes soil</span>
            </div>
          </div>
        </div>

        {/* Scenario B: SELLING VIA PARALI */}
        <div className="bg-[#EAF3ED] dark:bg-[#183328] border border-[#D8E2DC] dark:border-[#294237] rounded-2xl p-5 relative flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white dark:bg-[#101F18] text-[#174C38] dark:text-[#8BC7A3] border border-[#D8E2DC] dark:border-[#294237] uppercase tracking-wider">
                <CheckCircle className="h-3.5 w-3.5 text-[#174C38] dark:text-[#8BC7A3]" />
                Scenario B: Sell via Parali
              </span>
              <span className="text-[10px] font-bold text-[#174C38] dark:text-[#8BC7A3]">Net financial gain</span>
            </div>

            <div className="space-y-2.5 mb-5">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-[#D8E2DC]/60 dark:border-[#294237]">
                <span className="text-[#40594D] dark:text-[#B8C8BF] font-medium">Gross residue payout</span>
                <span className="font-mono font-bold text-[#174C38] dark:text-[#8BC7A3]">+₹{calcResult.selling_scenario.gross_income_inr.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-[#D8E2DC]/60 dark:border-[#294237]">
                <span className="text-[#40594D] dark:text-[#B8C8BF] font-medium">Soil N-P-K nutrients retained</span>
                <span className="font-mono font-bold text-[#174C38] dark:text-[#8BC7A3]">+₹{calcResult.burning_scenario.estimated_nutrient_loss_inr.toLocaleString('en-IN')} saved</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-[#D8E2DC]/60 dark:border-[#294237]">
                <span className="text-[#40594D] dark:text-[#B8C8BF] font-medium">Farmgate pickup transport</span>
                <span className="font-bold text-[#174C38] dark:text-[#8BC7A3]">Managed (₹0)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#D8E2DC] dark:border-[#294237]">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-bold text-[#687B72] dark:text-[#8FA69A] uppercase block">Net outcome (selling)</span>
                <span className="text-lg font-display font-black font-mono text-[#174C38] dark:text-[#8BC7A3]">
                  +₹{calcResult.selling_scenario.gross_income_inr.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-[10px] text-[#174C38] dark:text-[#8BC7A3] font-extrabold bg-white dark:bg-[#101F18] px-2.5 py-0.5 rounded-md border border-[#D8E2DC] dark:border-[#294237]">Guaranteed income</span>
            </div>
          </div>
        </div>
      </div>

      {/* Final Verdict Banner */}
      <div className="p-5 bg-[#174C38] dark:bg-[#183328] text-white rounded-2xl shadow-card border border-[#174C38] dark:border-[#294237] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-[#EAF3ED] font-mono uppercase tracking-wider block font-bold">Net economic advantage</span>
            <h4 className="text-base md:text-lg font-display font-extrabold text-white">
              {calcResult.verdict_headline}
            </h4>
          </div>
        </div>

        <div className="text-right self-stretch md:self-auto flex md:flex-col justify-between items-end border-t md:border-t-0 border-white/20 pt-3 md:pt-0">
          <span className="text-[10px] text-[#EAF3ED] font-mono uppercase block font-bold">Total value unlocked</span>
          <span className="text-xl font-display font-black font-mono text-[#8BC7A3]">
            ₹{calcResult.comparative_advantage_inr.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Footnote / Disclaimer */}
      <div className="mt-3 text-center text-[10px] text-[#687B72] dark:text-[#8FA69A] font-medium">
        {calcResult.disclaimer} Illustrative estimate based on configured agronomic assumptions.
      </div>
    </div>
  );
};
