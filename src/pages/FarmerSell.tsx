import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../context/AuthContext';
import { createResidueListing } from '../services/marketplaceService';
import { Sprout, IndianRupee, MapPin, Calendar, Camera, Info, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface FarmerSellProps {
  onBack: () => void;
}

export const FarmerSell: React.FC<FarmerSellProps> = ({ onBack }) => {
  const { addListing } = useAppStore();
  const { user, profile, farmerProfile } = useAuth();

  const [crop, setCrop] = useState<'Wheat' | 'Rice' | 'Maize' | 'Sugarcane' | 'Other'>('Wheat');
  const [residueType, setResidueType] = useState('Wheat Straw (Tudi)');
  const [quantity, setQuantity] = useState<number>(3);
  const [pickupLocation, setPickupLocation] = useState(profile?.village ? `${profile.village}, ${profile.district}` : 'Sangrur Fields Block A');
  const [pickupDate, setPickupDate] = useState('2026-08-22');
  const [valuationMin, setValuationMin] = useState(2400);
  const [valuationMax, setValuationMax] = useState(2800);
  const [submitting, setSubmitting] = useState(false);

  // Recalculate AI valuation based on inputs
  useEffect(() => {
    let basePricePerTonne = 800;
    if (crop === 'Rice') basePricePerTonne = 850;
    if (crop === 'Wheat') basePricePerTonne = 866;
    if (crop === 'Maize') basePricePerTonne = 750;
    if (crop === 'Sugarcane') basePricePerTonne = 900;

    const min = Math.round(quantity * basePricePerTonne * 0.92);
    const max = Math.round(quantity * basePricePerTonne * 1.08);
    setValuationMin(min);
    setValuationMax(max);
  }, [crop, quantity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const pricePerTonne = Math.round((valuationMin + valuationMax) / (2 * (quantity || 1))) || 1150;

    try {
      if (user) {
        await createResidueListing(user, {
          farmer_name: profile?.full_name || 'Verified Farmer',
          crop_type: crop,
          residue_type: residueType,
          quantity,
          price_per_tonne: pricePerTonne,
          pickup_location: pickupLocation,
          state: profile?.state || 'Punjab',
          district: profile?.district || 'Sangrur',
          village: profile?.village || '',
          pickup_ready_date: pickupDate
        });
      }

      addListing({
        cropType: crop,
        residueType,
        quantity,
        pickupLocation,
        coordinates: [31, 46],
        pickupDate,
        images: [],
        estimatedPriceMin: valuationMin,
        estimatedPriceMax: valuationMax
      });

      onBack();
    } catch (err) {
      console.error('Error creating residue listing:', err);
      onBack();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 font-sans">
      <button 
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-forest-800 hover:text-forest-950 font-bold mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      <h2 className="text-3xl font-extrabold text-forest-950">Sell crop residue</h2>
      <p className="text-sm text-forest-700 mt-1">
        List your residue to find verified buyers. Our trucks will collect directly from your field.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid md:grid-cols-12 gap-6">
        {/* Left inputs */}
        <div className="md:col-span-7 flex flex-col gap-5">
          <div className="bg-white border border-forest-100 p-5 rounded-2xl shadow-sm flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-forest-800 mb-1.5 uppercase tracking-wide">Crop Type</label>
              <select 
                value={crop}
                onChange={(e) => setCrop(e.target.value as any)}
                className="w-full text-sm p-3 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-500 font-semibold bg-white"
              >
                <option value="Wheat">Wheat</option>
                <option value="Rice">Rice</option>
                <option value="Maize">Maize</option>
                <option value="Sugarcane">Sugarcane</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-800 mb-1.5 uppercase tracking-wide">Residue Type Details</label>
              <input 
                type="text"
                value={residueType}
                onChange={(e) => setResidueType(e.target.value)}
                placeholder="e.g. Dry Wheat Straw, Loose Paddy Stubble"
                className="w-full text-sm p-3 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-500 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-800 mb-1.5 uppercase tracking-wide">Quantity (Tonnes)</label>
              <input 
                type="number"
                step="0.1"
                value={quantity || ''}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 3"
                className="w-full text-sm p-3 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-500 font-extrabold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-800 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Pickup Location
              </label>
              <input 
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="District, Field Coordinate description"
                className="w-full text-sm p-3 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-500 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-800 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Preferred Collection Date
              </label>
              <input 
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-500 font-semibold bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-800 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                <Camera className="h-3.5 w-3.5" /> Residue Photos (Optional)
              </label>
              <div className="border-2 border-dashed border-[#BFD3C6] bg-forest-50 rounded-xl p-8 text-center hover:border-forest-600 hover:bg-forest-100 cursor-pointer transition-all">
                <Camera className="h-7 w-7 text-forest-600 mx-auto mb-2" />
                <span className="text-sm text-forest-900 font-bold block">Tap to Upload Photos</span>
                <span className="text-[11px] text-forest-600 mt-1 block">Help buyers verify moisture &amp; compaction</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side AI Valuation card */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="bg-forest-50 border border-forest-150 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <span className="text-[10px] bg-forest-100 text-forest-900 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-forest-200">
              Parali Valuation AI
            </span>
            
            <h4 className="font-extrabold text-xs text-forest-700 mt-4 uppercase tracking-wider">Estimated Market Value</h4>
            <div className="flex items-baseline gap-1 mt-2 flex-wrap">
              <span className="text-4xl font-black text-forest-900">₹{valuationMin.toLocaleString('en-IN')}</span>
              <span className="text-lg font-bold text-forest-500 mx-1">–</span>
              <span className="text-4xl font-black text-forest-900">₹{valuationMax.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-forest-150 flex gap-2">
              <Info className="h-4 w-4 text-forest-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-forest-600 leading-relaxed font-medium">
                Valuation is generated by calculating distance to Rajpura Bio-energy Hub, current buyer demand metrics, and crop volume multipliers.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-forest-900 hover:bg-forest-950 text-white font-extrabold text-sm py-4 rounded-2xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating Listing...' : 'Confirm & List Residue'}
          </button>
        </div>
      </form>
    </div>
  );
};
