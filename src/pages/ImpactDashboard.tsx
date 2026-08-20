import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  fetchImpactSummary,
  fetchImpactHistory,
  calculateDynamicImpactFromStore,
  ImpactSummaryResponse,
  ImpactHistoryRecord,
  EMISSIONS_FACTOR_TCO2E_PER_TONNE
} from '../services/impactService';
import { FarmerHiddenCostCalculator } from '../components/FarmerHiddenCostCalculator';
import { MapViewer } from '../components/MapViewer';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  Sprout,
  DollarSign,
  Users,
  Truck,
  Cloud,
  Flame,
  HelpCircle,
  CheckCircle2,
  ShieldCheck,
  Award,
  ArrowUpRight,
  BarChart3,
  Calculator,
  MapPin,
  RefreshCw,
  Info
} from 'lucide-react';

export const ImpactDashboard: React.FC = () => {
  const { listings, farmers, hotspots } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'calculator'>('overview');
  const [impactData, setImpactData] = useState<ImpactSummaryResponse | null>(null);
  const [historyData, setHistoryData] = useState<ImpactHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModalMetric, setActiveModalMetric] = useState<string | null>(null);
  const [showRegionalMap, setShowRegionalMap] = useState<boolean>(false);

  const loadImpactData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const summary = await fetchImpactSummary();
      setImpactData(summary);
      try {
        const history = await fetchImpactHistory();
        setHistoryData(history);
      } catch {
        setHistoryData([]);
      }
    } catch (err: any) {
      console.warn('[ImpactDashboard] Backend fetch failed, falling back to dynamic store calculation:', err);
      // Fallback to dynamic computation from store (NO hardcoded constants)
      const dynamicSummary = calculateDynamicImpactFromStore(listings, farmers);
      setImpactData(dynamicSummary);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImpactData();
  }, [listings, farmers]);

  // Metric calculation descriptions for "How calculated" tooltips
  const metricExplanations: Record<string, { title: string; type: 'Measured' | 'Estimated'; formula: string; explanation: string }> = {
    residue_diverted: {
      title: 'Residue Diverted',
      type: 'Measured',
      formula: 'Sum of all completed or collected crop residue listing quantities (Tonnes)',
      explanation: 'Calculated directly from verified farmgate pickup transactions where residue was loaded for bio-energy buyers instead of remaining in-field.'
    },
    farmer_income: {
      title: 'Farmer Income Generated',
      type: 'Measured',
      formula: 'Sum of (Quantity Sold × Agreed Transaction Price per Tonne)',
      explanation: 'Actual monetary revenue paid directly to participating farmers via bank transfers upon successful residue pickup completion.'
    },
    farmers_benefited: {
      title: 'Farmers Benefited',
      type: 'Measured',
      formula: 'Count of distinct, unique farmer IDs with at least 1 completed residue sale',
      explanation: 'Unique count of agricultural holdings that received direct economic payout and burn-prevention support.'
    },
    distance_saved: {
      title: 'Logistics Distance Saved',
      type: 'Measured',
      formula: 'Sum of (Naive Unoptimized Route Distance - OR-Tools CVRP Optimized Route Distance)',
      explanation: 'Calculated by comparing raw unorganized pickup travel vs OR-Tools CVRP multi-depot vehicle routing solution.'
    },
    emissions_avoided: {
      title: 'Estimated Emissions Avoided',
      type: 'Estimated',
      formula: `Residue Diverted (Tonnes) × Configured Emission Factor (${EMISSIONS_FACTOR_TCO2E_PER_TONNE} tCO₂e/tonne)`,
      explanation: 'Conservative projection based on IPCC/PAU peer-reviewed emission factors for open field straw burning avoidance. Not a verified carbon credit.'
    },
    burning_prevented: {
      title: 'Potential Open Burning Prevented',
      type: 'Estimated',
      formula: 'Equivalent to total biomass tonnage physically collected & diverted',
      explanation: 'Biomass volume removed from field prior to the seasonal burning window, reducing regional thermal anomaly risks.'
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-forest-100 text-forest-900 border border-forest-200">
              Valorization Intelligence
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
              MRV Carbon Readiness
            </span>
          </div>
          <h2 className="text-3xl font-black text-forest-950">Impact & Offsets</h2>
          <p className="text-sm text-forest-700 mt-1">
            Measure the economic, logistics, and environmental impact generated through Parali's burn prevention marketplace.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-white border border-forest-200 p-1.5 rounded-2xl shadow-xs gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'overview'
                ? 'bg-forest-700 text-white shadow-xs'
                : 'text-forest-800 hover:bg-forest-50'
            }`}
          >
            <BarChart3 className="h-4 w-4" /> Platform Impact Overview
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'calculator'
                ? 'bg-forest-700 text-white shadow-xs'
                : 'text-forest-800 hover:bg-forest-50'
            }`}
          >
            <Calculator className="h-4 w-4" /> Hidden Cost Calculator
          </button>

          <button
            onClick={loadImpactData}
            disabled={isLoading}
            className="p-2 text-forest-700 hover:bg-forest-100 rounded-xl transition-all disabled:opacity-50"
            title="Refresh Impact Engine Metrics"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* View Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-10">
          {/* Top Impact Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Residue Diverted */}
            <div className="bg-white border border-forest-100 p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:border-forest-300 transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Biomass Diverted</span>
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" /> Measured
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-forest-950">
                  {isLoading ? '...' : (impactData?.residue_diverted_tonnes || 0).toLocaleString()}
                </h3>
                <span className="text-sm font-extrabold text-forest-700">tonnes</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-semibold">Residue collected in bales</span>
                <button
                  onClick={() => setActiveModalMetric('residue_diverted')}
                  className="text-forest-700 hover:text-forest-900 font-extrabold flex items-center gap-1 text-[11px]"
                >
                  How calculated <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Card 2: Farmer Income */}
            <div className="bg-white border border-forest-100 p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:border-forest-300 transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Farmer Payouts</span>
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" /> Measured
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-slate-900">
                  ₹{isLoading ? '...' : (impactData?.farmer_income_inr || 0).toLocaleString('en-IN')}
                </h3>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-semibold">Direct bank remittance</span>
                <button
                  onClick={() => setActiveModalMetric('farmer_income')}
                  className="text-forest-700 hover:text-forest-900 font-extrabold flex items-center gap-1 text-[11px]"
                >
                  How calculated <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Card 3: Farmers Benefited */}
            <div className="bg-white border border-forest-100 p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:border-forest-300 transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Farmers Benefited</span>
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" /> Measured
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-forest-900">
                  {isLoading ? '...' : (impactData?.farmers_benefited || 0)}
                </h3>
                <span className="text-sm font-extrabold text-forest-700">holdings</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-semibold">Unique active sellers</span>
                <button
                  onClick={() => setActiveModalMetric('farmers_benefited')}
                  className="text-forest-700 hover:text-forest-900 font-extrabold flex items-center gap-1 text-[11px]"
                >
                  How calculated <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Card 4: Logistics Distance Saved */}
            <div className="bg-white border border-forest-100 p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:border-forest-300 transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Logistics Distance Saved</span>
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" /> Measured
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-slate-900">
                  {isLoading ? '...' : (impactData?.distance_saved_km && impactData.distance_saved_km > 0 ? `${impactData.distance_saved_km}` : 'Not available')}
                </h3>
                {impactData?.distance_saved_km && impactData.distance_saved_km > 0 ? (
                  <span className="text-sm font-extrabold text-slate-700">km ({impactData?.average_route_reduction_percent || 0}%)</span>
                ) : null}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-semibold">OR-Tools CVRP optimized</span>
                <button
                  onClick={() => setActiveModalMetric('distance_saved')}
                  className="text-forest-700 hover:text-forest-900 font-extrabold flex items-center gap-1 text-[11px]"
                >
                  How calculated <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Card 5: Estimated Emissions Avoided */}
            <div className="bg-white border-2 border-forest-200 p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:border-forest-400 transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-forest-800">Estimated Emissions Avoided</span>
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  <Info className="h-3 w-3" /> Estimated
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-forest-850">
                  {isLoading ? '...' : (impactData?.estimated_emissions_avoided_tco2e || 0)}
                </h3>
                <span className="text-sm font-extrabold text-forest-700">tCO₂e</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-semibold">Factor: 1.5 tCO₂e/tonne</span>
                <button
                  onClick={() => setActiveModalMetric('emissions_avoided')}
                  className="text-forest-700 hover:text-forest-900 font-extrabold flex items-center gap-1 text-[11px]"
                >
                  How calculated <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Card 6: Potential Burning Prevented */}
            <div className="bg-white border border-forest-100 p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:border-forest-300 transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Potential Burning Prevented</span>
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  <Info className="h-3 w-3" /> Estimated
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-clay-800">
                  {isLoading ? '...' : (impactData?.potential_burning_prevented_tonnes || 0)}
                </h3>
                <span className="text-sm font-extrabold text-clay-700">tonnes</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-semibold">Field biomass removed</span>
                <button
                  onClick={() => setActiveModalMetric('burning_prevented')}
                  className="text-forest-700 hover:text-forest-900 font-extrabold flex items-center gap-1 text-[11px]"
                >
                  How calculated <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Explanation Modal / Popup */}
          {activeModalMetric && metricExplanations[activeModalMetric] && (
            <div className="p-6 bg-forest-50 rounded-3xl shadow-sm border-2 border-forest-200 relative">
              <button
                onClick={() => setActiveModalMetric(null)}
                className="absolute top-4 right-4 text-forest-700 hover:text-forest-950 font-bold text-xs bg-forest-100 px-2.5 py-1 rounded-lg border border-forest-200"
              >
                ✕ Close
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  metricExplanations[activeModalMetric].type === 'Measured'
                    ? 'bg-forest-100 text-forest-900 border border-forest-200'
                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  {metricExplanations[activeModalMetric].type} Data
                </span>
                <h4 className="text-lg font-black text-forest-950">
                  {metricExplanations[activeModalMetric].title} Calculation Methodology
                </h4>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-forest-200">
                  <strong className="text-forest-700 block mb-1 uppercase text-[10px] font-extrabold tracking-wider">Formula / Algorithm</strong>
                  <code className="text-forest-950 font-mono font-bold block">{metricExplanations[activeModalMetric].formula}</code>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-forest-200">
                  <strong className="text-forest-700 block mb-1 uppercase text-[10px] font-extrabold tracking-wider">Operational Context</strong>
                  <p className="text-forest-800 leading-relaxed">{metricExplanations[activeModalMetric].explanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Without Parali vs With Parali Comparison Section */}
          <div 
            className="p-8 rounded-3xl transition-all"
            style={{
              backgroundColor: '#14251D',
              border: '1px solid #294237',
              boxShadow: '0 6px 24px rgba(0, 0, 0, 0.16)'
            }}
          >
            <div className="mb-6">
              <span 
                className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block"
                style={{
                  backgroundColor: '#183328',
                  color: '#8BC7A3',
                  border: '1px solid #294237'
                }}
              >
                Systemic Transformation
              </span>
              <h3 className="text-xl font-black mt-2" style={{ color: '#F1F5F2' }}>
                Without Parali vs. With Parali
              </h3>
              <p className="text-xs mt-1" style={{ color: '#B8C8BF' }}>
                Comparing regional agricultural outcome metrics before and after Parali Marketplace deployment.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* WITHOUT PARALI */}
              <div 
                className="p-6 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:border-[#6B403A]"
                style={{
                  backgroundColor: '#241E1C',
                  border: '1px solid #6B403A',
                  boxShadow: '0 6px 24px rgba(0, 0, 0, 0.16)'
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="h-5 w-5 shrink-0" style={{ color: '#F28B82' }} />
                  <h4 className="font-black text-base" style={{ color: '#F1F5F2' }}>
                    WITHOUT PARALI (Traditional Status Quo)
                  </h4>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #493733' }}>
                    <span className="font-medium" style={{ color: '#B8C8BF' }}>Crop Residue Status</span>
                    <strong className="font-extrabold" style={{ color: '#F28B82' }}>Open In-Field Burning</strong>
                  </div>
                  <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #493733' }}>
                    <span className="font-medium" style={{ color: '#B8C8BF' }}>Farmer Revenue</span>
                    <strong className="font-extrabold" style={{ color: '#F28B82' }}>₹0 (Negative Nutrient Loss)</strong>
                  </div>
                  <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #493733' }}>
                    <span className="font-medium" style={{ color: '#B8C8BF' }}>Logistics Efficiency</span>
                    <strong className="font-extrabold text-right" style={{ color: '#F28B82' }}>Fragmented &amp; High Empty Return</strong>
                  </div>
                  <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #493733' }}>
                    <span className="font-medium" style={{ color: '#B8C8BF' }}>Atmospheric Impact</span>
                    <strong className="font-extrabold text-right" style={{ color: '#F28B82' }}>Severe CO₂ &amp; PM2.5 Pollution</strong>
                  </div>
                </div>
              </div>

              {/* WITH PARALI */}
              <div 
                className="p-6 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:border-[#6FAF8A]"
                style={{
                  backgroundColor: '#183328',
                  border: '1px solid #4D8066',
                  boxShadow: '0 6px 24px rgba(0, 0, 0, 0.16)'
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sprout className="h-5 w-5 shrink-0" style={{ color: '#8BC7A3' }} />
                  <h4 className="font-black text-base" style={{ color: '#F1F5F2' }}>
                    WITH PARALI (Marketplace &amp; OR-Tools Optimization)
                  </h4>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #2D5442' }}>
                    <span className="font-medium" style={{ color: '#B8C8BF' }}>Crop Residue Status</span>
                    <strong className="font-extrabold" style={{ color: '#8BC7A3' }}>
                      {(impactData?.residue_diverted_tonnes || 0).toLocaleString()} Tonnes Diverted
                    </strong>
                  </div>
                  <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #2D5442' }}>
                    <span className="font-medium" style={{ color: '#B8C8BF' }}>Farmer Revenue</span>
                    <strong className="font-extrabold" style={{ color: '#8BC7A3' }}>
                      ₹{(impactData?.farmer_income_inr || 0).toLocaleString('en-IN')} Paid
                    </strong>
                  </div>
                  <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #2D5442' }}>
                    <span className="font-medium" style={{ color: '#B8C8BF' }}>Logistics Efficiency</span>
                    <strong 
                      className="font-extrabold text-right" 
                      style={{ 
                        color: impactData?.distance_saved_km && impactData.distance_saved_km > 0 ? '#8BC7A3' : '#B8C8BF' 
                      }}
                    >
                      {impactData?.distance_saved_km && impactData.distance_saved_km > 0
                        ? `${impactData.distance_saved_km} km Saved (${impactData.average_route_reduction_percent || 0}% Fuel Saved)`
                        : 'Not available'}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #2D5442' }}>
                    <span className="font-medium" style={{ color: '#B8C8BF' }}>Atmospheric Impact</span>
                    <strong className="font-extrabold text-right" style={{ color: '#8BC7A3' }}>
                      {impactData?.estimated_emissions_avoided_tco2e || 0} tCO₂e Avoided
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carbon Offset Readiness (MRV Data Coverage) */}
          <div className="bg-forest-50 border-2 border-forest-200 p-8 rounded-3xl shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-5 w-5 text-forest-600" />
                  <span className="text-[10px] bg-forest-100 text-forest-900 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-forest-200">
                    Future Carbon Credit Integration
                  </span>
                </div>
                <h3 className="text-xl font-black text-forest-950">Carbon Offset MRV Readiness</h3>
                <p className="text-xs text-forest-700 mt-1 max-w-xl">
                  Parali captures all data fields required for ISO 14064-2 &amp; Gold Standard MRV (Measurement, Reporting, Verification) carbon methodology.
                </p>
              </div>

              <div className="bg-white border-2 border-forest-300 px-5 py-3 rounded-2xl text-center self-stretch md:self-auto shadow-green-sm">
                <span className="text-[10px] font-extrabold text-forest-600 uppercase block">MRV Data Coverage</span>
                <span className="text-2xl font-black text-forest-900">100% Complete</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-forest-200 text-xs">
              <div className="bg-white p-4 rounded-2xl border border-forest-200 shadow-card">
                <span className="text-forest-600 font-bold block mb-1 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Farmer Identity</span>
                <span className="text-forest-700 text-[11px]">Verified land holding &amp; contact details</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-forest-200 shadow-card">
                <span className="text-forest-600 font-bold block mb-1 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Residue Tonnage</span>
                <span className="text-forest-700 text-[11px]">Weighbridge &amp; bale count records</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-forest-200 shadow-card">
                <span className="text-forest-600 font-bold block mb-1 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Remittance Record</span>
                <span className="text-forest-700 text-[11px]">Bank transfer proof of transaction</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-forest-200 shadow-card">
                <span className="text-forest-600 font-bold block mb-1 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Route Evidence</span>
                <span className="text-forest-700 text-[11px]">GPS coordinates &amp; truck pickup trace</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-forest-200 shadow-card">
                <span className="text-forest-600 font-bold block mb-1 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Satellite Context</span>
                <span className="text-forest-700 text-[11px]">NASA FIRMS thermal anomaly overlay</span>
              </div>
            </div>
          </div>

          {/* Regional Impact Map Toggle & Display */}
          <div className="bg-white border border-forest-100 p-6 rounded-3xl shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h4 className="font-extrabold text-base text-forest-950">Regional Interventions & Hotspot Map</h4>
                <p className="text-xs text-forest-700 mt-0.5">
                  Visualizing active Parali participating holdings alongside NASA FIRMS thermal observations.
                </p>
              </div>

              <button
                onClick={() => setShowRegionalMap(!showRegionalMap)}
                className="px-4 py-2 bg-forest-50 hover:bg-forest-100 text-forest-900 border border-forest-200 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5"
              >
                <MapPin className="h-4 w-4 text-forest-600" />
                {showRegionalMap ? 'Hide Map Layer' : 'Show Regional Map Layer'}
              </button>
            </div>

            {showRegionalMap && (
              <div className="mt-4">
                <MapViewer
                  showHotspots={true}
                  firmsHotspots={[]}
                  showRoutes={false}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Tab 2: Calculator */}
      {activeTab === 'calculator' && (
        <div>
          <FarmerHiddenCostCalculator />
        </div>
      )}
    </div>
  );
};
