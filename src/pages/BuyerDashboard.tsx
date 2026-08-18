import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Layers, MapPin } from 'lucide-react';

interface BuyerDashboardProps {
  onNavigateToMarketplace: () => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ onNavigateToMarketplace }) => {
  const { requirements, demoStep, listings, confirmBuyerRequirement } = useAppStore();
  const { profile, buyerProfile, user } = useAuth();

  const buyerName = buyerProfile?.business_name || profile?.full_name || user?.user_metadata?.full_name || 'GreenGrow Mushroom Farm';
  const buyerTypeFormatted = buyerProfile?.buyer_type ? buyerProfile.buyer_type.replace('_', ' ') : 'Mushroom Farm';
  const targetQuantity = buyerProfile?.required_quantity_tonnes || 128;
  const radiusKm = buyerProfile?.procurement_radius_km || 50;
  const locationText = profile?.district ? `${profile.district}, ${profile.state}` : 'Patiala, Punjab';

  const [showPostForm, setShowPostForm] = useState(false);
  const [crop, setCrop] = useState<'Wheat' | 'Rice' | 'Maize' | 'Sugarcane' | 'Other'>('Wheat');
  const [quantity, setQuantity] = useState(50);
  const [maxPrice, setMaxPrice] = useState(1200);

  // Ramesh's active listing (if listed/matched)
  const rameshListing = listings.find(l => l.farmerId === 'f1' && l.status === 'Matched');

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPostForm(false);
    useAppStore.setState(state => ({
      requirements: [
        {
          id: `req_${Date.now()}`,
          buyerId: profile?.id || 'b1',
          buyerName,
          cropType: crop,
          residueType: `${crop} Residue`,
          quantityNeeded: quantity,
          maxPricePerTonne: maxPrice,
          deliveryDate: '2026-08-25',
          region: profile?.state || 'Punjab'
        },
        ...state.requirements
      ]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-clay-700 mb-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{locationText} • {radiusKm} km radius ({buyerTypeFormatted})</span>
          </div>
          <h2 className="text-3xl font-extrabold text-forest-950">
            Good morning, {buyerName} 👋
          </h2>
          <p className="text-sm text-forest-700 mt-1">
            Biomass procurement overview & supply network matching.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="bg-clay-600 hover:bg-clay-700 text-white font-bold px-5 py-3 rounded-2xl shadow-md transition-all text-xs"
          >
            Post Requirement
          </button>
          <button
            onClick={onNavigateToMarketplace}
            className="bg-forest-600 hover:bg-forest-700 text-white font-bold px-5 py-3 rounded-2xl shadow-md transition-all text-xs flex items-center gap-1.5"
          >
            Biomass Marketplace <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Post Requirement Form Panel */}
      {showPostForm && (
        <form onSubmit={handlePost} className="bg-white border border-forest-100 p-6 rounded-3xl mb-8 shadow-sm max-w-xl">
          <h4 className="font-extrabold text-base text-forest-950 mb-4">Post Sourcing Requirement</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-forest-800 mb-1 uppercase tracking-wide">Crop</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-forest-200 bg-white font-semibold"
              >
                <option value="Wheat">Wheat</option>
                <option value="Rice">Rice</option>
                <option value="Maize">Maize</option>
                <option value="Sugarcane">Sugarcane</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-forest-800 mb-1 uppercase tracking-wide">Quantity (t)</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full text-xs p-2.5 rounded-xl border border-forest-200 font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-forest-800 mb-1 uppercase tracking-wide">Max Price (₹/t)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value) || 0)}
                className="w-full text-xs p-2.5 rounded-xl border border-forest-200 font-bold"
              />
            </div>
          </div>
          <button type="submit" className="mt-4 bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all">
            Find Potential Suppliers
          </button>
        </form>
      )}

      {/* Buyer Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white border border-forest-100 p-6 rounded-3xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Requirements</span>
          <h3 className="text-2xl font-black text-slate-800 mt-2">{requirements.length} postings</h3>
          <p className="text-[10px] text-forest-600 font-semibold mt-1">Sourcing target: {targetQuantity} tonnes</p>
        </div>

        <div className="bg-white border border-forest-100 p-6 rounded-3xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sourced volume</span>
          <h3 className="text-2xl font-black text-slate-800 mt-2">{targetQuantity} tonnes</h3>
          <p className="text-[10px] text-forest-600 font-semibold mt-1">Diverted from stubble fires</p>
        </div>

        <div className="bg-white border border-forest-100 p-6 rounded-3xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Procurement Cost</span>
          <h3 className="text-2xl font-black text-slate-800 mt-2">₹1,180 / Tonne</h3>
          <p className="text-[10px] text-forest-600 font-semibold mt-1">Market standard: ₹1,300/t</p>
        </div>

        <div className="bg-white border border-forest-100 p-6 rounded-3xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Farms Connected</span>
          <h3 className="text-2xl font-black text-slate-800 mt-2">14 active</h3>
          <p className="text-[10px] text-forest-600 font-semibold mt-1">Within {radiusKm} km radius</p>
        </div>
      </div>

      {/* Demo Action: Accept matched farmer stubble (Ramesh) */}
      {rameshListing && demoStep === 4 && (
        <div className="bg-clay-50 border-2 border-clay-300 rounded-3xl p-6 mb-10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] bg-clay-100 text-clay-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              AI Match Alert • 94% score
            </span>
            <h4 className="font-extrabold text-base text-forest-950 mt-2">
              Ramesh Kumar has 3.0 tonnes of Wheat Straw available in Sangrur
            </h4>
            <p className="text-xs text-forest-750 mt-1">
              Fulfills your mushroom bedding requirement at ₹866 / Tonne. Est logistics savings: 18%.
            </p>
          </div>
          <button
            onClick={() => confirmBuyerRequirement(rameshListing.id)}
            className="bg-clay-600 hover:bg-clay-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl transition-all shadow shrink-0"
          >
            Accept Match & Confirm Contract
          </button>
        </div>
      )}

      {/* Sourcing Timeline / Active Contracts */}
      <div className="bg-white border border-forest-100 rounded-3xl p-6 shadow-sm">
        <h4 className="font-extrabold text-base text-forest-950 mb-4 flex items-center gap-1.5">
          <Layers className="h-5 w-5 text-forest-600" /> Active Sourcing Contracts
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-extrabold tracking-wider">
                <th className="py-3 px-4">Contract ID</th>
                <th className="py-3 px-4">Farmer</th>
                <th className="py-3 px-4">Residue Type</th>
                <th className="py-3 px-4">Tonnage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Scheduled Collection</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">#{l.id.substring(0, 6)}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-700">{l.farmerName}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600">{l.residueType}</td>
                  <td className="py-3.5 px-4 font-extrabold text-forest-900">{l.quantity} tonnes</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      l.status === 'Paid' ? 'bg-forest-100 text-forest-800' :
                      l.status === 'Confirmed' ? 'bg-clay-100 text-clay-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-500">{l.pickupDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
