import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createBuyerDemand } from '../services/marketplaceService';
import { BuyerDemandItem } from '../types/marketplace';
import { BuyerType } from '../types/profile';
import { Briefcase, Sprout, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface BuyerDemandProps {
  onRequirementCreated: (createdDemand: BuyerDemandItem) => void;
  onCancel?: () => void;
}

export const BuyerDemand: React.FC<BuyerDemandProps> = ({ onRequirementCreated, onCancel }) => {
  const { user, profile, buyerProfile } = useAuth();

  const [companyName, setCompanyName] = useState(
    buyerProfile?.business_name || profile?.full_name || ''
  );
  const [buyerType, setBuyerType] = useState<BuyerType>(
    buyerProfile?.buyer_type || 'mushroom_farm'
  );
  const [cropType, setCropType] = useState<string>('Rice');
  const [residueType, setResidueType] = useState<string>('Rice Straw');
  const [requiredQuantity, setRequiredQuantity] = useState<string>('50');
  const [maxPrice, setMaxPrice] = useState<string>('1300');
  const [preferredState, setPreferredState] = useState<string>(profile?.state || 'Punjab');
  const [preferredDistrict, setPreferredDistrict] = useState<string>(profile?.district || 'Sangrur');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(
    buyerProfile?.procurement_radius_km || 50
  );
  const [requiredByDate, setRequiredByDate] = useState<string>(
    new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
  );
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('You must be signed in to post a requirement.');
      return;
    }

    const qtyNum = parseFloat(requiredQuantity);
    const priceNum = parseFloat(maxPrice);

    if (isNaN(qtyNum) || qtyNum <= 0) {
      setErrorMsg('Please enter a valid required quantity in tonnes.');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('Please enter a valid maximum price per tonne.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const createdDemand = await createBuyerDemand(user, {
        company_name: companyName.trim(),
        buyer_type: buyerType,
        crop_type: cropType,
        residue_type: residueType,
        required_quantity_tonnes: qtyNum,
        max_price_per_tonne: priceNum,
        preferred_state: preferredState.trim(),
        preferred_district: preferredDistrict.trim(),
        max_distance_km: maxDistanceKm,
        required_by_date: requiredByDate,
        additional_notes: additionalNotes.trim()
      });

      onRequirementCreated(createdDemand);
    } catch (err: any) {
      console.error('Error creating buyer demand:', err);
      setErrorMsg(err.message || 'Could not publish requirement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 font-sans selection:bg-forest-200">
      
      {/* Header Banner */}
      <div className="bg-white border border-forest-100 rounded-3xl p-6 md:p-8 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-clay-50 rounded-full blur-2xl opacity-60"></div>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-clay-100 text-clay-700 rounded-xl">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-clay-800">
            Demand Creation
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950">
          Post a Biomass Requirement
        </h1>
        <p className="text-xs md:text-sm text-forest-750 mt-1 max-w-xl">
          Tell farmers what crop residue you need and let Parali find suitable residue listings in your area.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-clay-50 border border-clay-200 text-clay-900 text-xs p-4 rounded-2xl mb-6 font-semibold flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-clay-700 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-forest-100 rounded-3xl p-6 md:p-10 shadow-md space-y-6">
        
        {/* Section 1: Business Identity */}
        <div>
          <h3 className="text-sm font-extrabold text-forest-950 uppercase tracking-wider mb-3">
            1. Business Entity
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">Company / Entity Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. GreenGrow Bio-Energy Plant"
                className="w-full text-xs p-3.5 rounded-xl border border-forest-200 font-bold text-forest-950 outline-none focus:ring-2 focus:ring-forest-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">Buyer Industry Type</label>
              <select
                value={buyerType}
                onChange={(e) => setBuyerType(e.target.value as BuyerType)}
                className="w-full text-xs p-3.5 rounded-xl border border-forest-200 bg-white font-bold text-forest-950 outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="mushroom_farm">Mushroom Cultivation Farm</option>
                <option value="paper_mill">Paper & Pulp Mill</option>
                <option value="biomass_plant">Biomass Power Plant</option>
                <option value="biofuel">Bio-CNG / Biofuel Facility</option>
                <option value="cattle_feed">Cattle Feed Manufacturer</option>
                <option value="compost">Organic Compost Facility</option>
                <option value="other">Other Industrial User</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Biomass Requirements */}
        <div className="pt-4 border-t border-forest-100">
          <h3 className="text-sm font-extrabold text-forest-950 uppercase tracking-wider mb-3">
            2. Biomass Requirements
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">Crop Type</label>
              <select
                value={cropType}
                onChange={(e) => {
                  setCropType(e.target.value);
                  setResidueType(`${e.target.value} Straw`);
                }}
                className="w-full text-xs p-3.5 rounded-xl border border-forest-200 bg-white font-bold text-forest-950 outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="Rice">Rice / Paddy</option>
                <option value="Wheat">Wheat</option>
                <option value="Maize">Maize</option>
                <option value="Sugarcane">Sugarcane</option>
                <option value="Cotton">Cotton</option>
                <option value="Other">Other Crop</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">Specific Residue Description</label>
              <input
                type="text"
                value={residueType}
                onChange={(e) => setResidueType(e.target.value)}
                placeholder="e.g. Rice Straw Bales, Loose Wheat Straw..."
                className="w-full text-xs p-3.5 rounded-xl border border-forest-200 font-semibold outline-none focus:ring-2 focus:ring-forest-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">Required Quantity (Tonnes)</label>
              <input
                type="number"
                step="5"
                min="1"
                value={requiredQuantity}
                onChange={(e) => setRequiredQuantity(e.target.value)}
                placeholder="e.g. 50"
                className="w-full text-xs p-3.5 rounded-xl border border-forest-200 font-bold text-forest-950 outline-none focus:ring-2 focus:ring-forest-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">Maximum Price Offered (₹ / Tonne)</label>
              <input
                type="number"
                step="50"
                min="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 1300"
                className="w-full text-xs p-3.5 rounded-xl border border-forest-200 font-bold text-forest-950 outline-none focus:ring-2 focus:ring-forest-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Location & Logistics */}
        <div className="pt-4 border-t border-forest-100">
          <h3 className="text-sm font-extrabold text-forest-950 uppercase tracking-wider mb-3">
            3. Operational Location & Timeline
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">Preferred State</label>
              <input
                type="text"
                value={preferredState}
                onChange={(e) => setPreferredState(e.target.value)}
                className="w-full text-xs p-3.5 rounded-xl border border-forest-200 font-semibold outline-none focus:ring-2 focus:ring-forest-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">Preferred District</label>
              <input
                type="text"
                value={preferredDistrict}
                onChange={(e) => setPreferredDistrict(e.target.value)}
                placeholder="e.g. Patiala"
                className="w-full text-xs p-3.5 rounded-xl border border-forest-200 font-semibold outline-none focus:ring-2 focus:ring-forest-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">Maximum Pickup Radius (km)</label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map((radius) => (
                  <button
                    key={radius}
                    type="button"
                    onClick={() => setMaxDistanceKm(radius)}
                    className={`p-2.5 text-center rounded-xl text-xs font-bold border transition-all ${
                      maxDistanceKm === radius
                        ? 'bg-clay-600 text-white border-clay-600 shadow-sm'
                        : 'bg-cream-50 border-forest-100 text-forest-800'
                    }`}
                  >
                    {radius} km
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">Required By Date</label>
              <input
                type="date"
                value={requiredByDate}
                onChange={(e) => setRequiredByDate(e.target.value)}
                className="w-full text-xs p-3.5 rounded-xl border border-forest-200 font-bold outline-none focus:ring-2 focus:ring-forest-500"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">Additional Guidelines / Notes (Optional)</label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Prefer baled straw with moisture content under 15%..."
              className="w-full text-xs p-3.5 rounded-xl border border-forest-200 font-semibold outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-forest-100">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          ) : (
            <div></div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-forest-600 hover:bg-forest-700 text-white font-extrabold text-xs py-4 px-8 rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <span>Publishing Requirement...</span>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> Publish Requirement & Find Matches
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
