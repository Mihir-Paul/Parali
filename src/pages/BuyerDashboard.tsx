import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../context/AuthContext';
import { fetchBuyerPurchaseRequests } from '../services/purchaseRequestService';
import { PurchaseRequestItem } from '../types/marketplace';
import {
  ArrowRight,
  Layers,
  MapPin,
  Sprout,
  ShieldCheck,
  IndianRupee,
  FileSpreadsheet,
  PlusCircle,
  Sparkles,
  Clock
} from 'lucide-react';

interface BuyerDashboardProps {
  onNavigateToMarketplace: () => void;
  onNavigateToDemand?: () => void;
  onNavigateToMatches?: () => void;
  onNavigateToRequests?: () => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  onNavigateToMarketplace,
  onNavigateToDemand,
  onNavigateToMatches,
  onNavigateToRequests
}) => {
  const { requirements, listings, confirmBuyerRequirement } = useAppStore();
  const { profile, buyerProfile, user } = useAuth();
  const [requests, setRequests] = useState<PurchaseRequestItem[]>([]);

  useEffect(() => {
    fetchBuyerPurchaseRequests(user?.id).then((data) => setRequests(data));
  }, [user]);

  const buyerName = buyerProfile?.business_name || profile?.full_name || user?.user_metadata?.full_name || 'GreenGrow Bio-Energy Plant';
  const buyerTypeFormatted = buyerProfile?.buyer_type ? buyerProfile.buyer_type.replace('_', ' ') : 'Bio-CNG Facility';
  const targetQuantity = buyerProfile?.required_quantity_tonnes || 128;
  const radiusKm = buyerProfile?.procurement_radius_km || 50;
  const locationText = profile?.district ? `${profile.district}, ${profile.state}` : 'Patiala, Punjab';

  // Ramesh's active listing (if listed/matched) for demo matching
  const rameshListing = listings.find((l) => l.farmerId === 'f1' && l.status === 'Matched');

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const activeSourcingCount = requests.filter((r) => r.status === 'Accepted' || r.status === 'Confirmed' || r.status === 'Pickup_Planned').length;

  // Sourcing impact calculations
  const totalSourcedTonnes = 28.5;
  const estimatedBurnsPrevented = Math.round(totalSourcedTonnes * 1.2);
  const estimatedFarmerEarnings = Math.round(totalSourcedTonnes * 1150);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 font-sans selection:bg-forest-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold mb-1 uppercase tracking-wider" style={{ color: '#2F6B4F' }}>
            <MapPin className="h-3.5 w-3.5 text-[#2F6B4F]" />
            <span>{locationText} • {radiusKm} km radius ({buyerTypeFormatted})</span>
          </div>
          <h2 className="text-3xl font-extrabold" style={{ color: '#102F24' }}>
            Good morning, {buyerName}
          </h2>
          <p className="text-sm mt-1" style={{ color: '#40594D' }}>
            Biomass procurement overview & automated supply network matching.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {onNavigateToDemand && (
            <button
              onClick={onNavigateToDemand}
              style={{ backgroundColor: '#B86B27', color: '#FFFFFF' }}
              className="hover:opacity-90 font-extrabold px-5 py-3 rounded-2xl shadow-md transition-all text-xs flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Post Requirement
            </button>
          )}

          <button
            onClick={onNavigateToMarketplace}
            style={{ backgroundColor: '#12372A', color: '#FFFFFF' }}
            className="hover:opacity-90 font-extrabold px-5 py-3 rounded-2xl shadow-md transition-all text-xs flex items-center gap-1.5"
          >
            Biomass Marketplace <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Buyer Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div style={{ backgroundColor: '#12372A', borderColor: '#294237' }} className="border p-6 rounded-3xl shadow-sm hover:-translate-y-1 transition-all">
          <span style={{ color: '#B8C8BF' }} className="text-[10px] font-extrabold uppercase tracking-wider block">Total Requirements</span>
          <h3 style={{ color: '#F1F5F2' }} className="text-2xl font-black mt-2">{requirements.length + 1} active</h3>
          <p style={{ color: '#81958A' }} className="text-[10px] font-bold mt-1">Target volume: {targetQuantity} tonnes</p>
        </div>

        <div style={{ backgroundColor: '#12372A', borderColor: '#294237' }} className="border p-6 rounded-3xl shadow-sm hover:-translate-y-1 transition-all">
          <span style={{ color: '#B8C8BF' }} className="text-[10px] font-extrabold uppercase tracking-wider block">Active Sourcing</span>
          <h3 style={{ color: '#F1F5F2' }} className="text-2xl font-black mt-2">{activeSourcingCount} contracts</h3>
          <p style={{ color: '#81958A' }} className="text-[10px] font-bold mt-1">Scheduled for pickup this week</p>
        </div>

        <div style={{ backgroundColor: '#12372A', borderColor: '#294237' }} className="border p-6 rounded-3xl shadow-sm hover:-translate-y-1 transition-all">
          <span style={{ color: '#B8C8BF' }} className="text-[10px] font-extrabold uppercase tracking-wider block">Total Residue Sourced</span>
          <h3 style={{ color: '#F1F5F2' }} className="text-2xl font-black mt-2">{totalSourcedTonnes} tonnes</h3>
          <p style={{ color: '#81958A' }} className="text-[10px] font-bold mt-1">Diverted from stubble burning</p>
        </div>

        <div style={{ backgroundColor: '#12372A', borderColor: '#294237' }} className="border p-6 rounded-3xl shadow-sm hover:-translate-y-1 transition-all">
          <span style={{ color: '#B8C8BF' }} className="text-[10px] font-extrabold uppercase tracking-wider block">Pending Requests</span>
          <h3 style={{ color: '#F1F5F2' }} className="text-2xl font-black mt-2">{pendingCount} pending</h3>
          <p style={{ color: '#6FAF8A' }} className="text-[10px] font-bold mt-1">Awaiting farmer confirmation</p>
        </div>
      </div>

      {/* Match Action Alert */}
      {rameshListing && (
        <div style={{ backgroundColor: '#1C3429', borderColor: '#294237' }} className="border-2 rounded-3xl p-6 mb-10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span style={{ backgroundColor: '#24563E', color: '#8BC7A3', borderColor: '#2F6B4F' }} className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border">
              AI Match Alert • 94% score
            </span>
            <h4 style={{ color: '#F1F5F2' }} className="font-extrabold text-base mt-2">
              Ramesh Kumar has 3.0 tonnes of Wheat Straw available in Sangrur
            </h4>
            <p style={{ color: '#B8C8BF' }} className="text-xs mt-1">
              Fulfills your bio-bedding requirement at ₹866 / Tonne. Est logistics savings: 18%.
            </p>
          </div>
          <button
            onClick={() => confirmBuyerRequirement(rameshListing.id)}
            style={{ backgroundColor: '#B86B27', color: '#FFFFFF' }}
            className="hover:opacity-90 font-extrabold text-xs px-6 py-3 rounded-2xl transition-all shadow shrink-0"
          >
            Accept Match & Confirm Contract
          </button>
        </div>
      )}

      {/* Quick Navigation Quick Action Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div
          onClick={onNavigateToMarketplace}
          style={{ backgroundColor: '#12372A', borderColor: '#294237' }}
          className="border p-6 rounded-3xl shadow-sm cursor-pointer transition-all flex flex-col justify-between group hover:border-[#6FAF8A]"
        >
          <div>
            <div style={{ backgroundColor: '#1C3429', color: '#8BC7A3' }} className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all">
              <Sprout className="h-6 w-6" />
            </div>
            <h4 style={{ color: '#F1F5F2' }} className="text-lg font-extrabold">Residue Marketplace</h4>
            <p style={{ color: '#B8C8BF' }} className="text-xs mt-1 leading-relaxed">
              Explore live crop stubble listings with 3D specs, price comparison, and instant purchase requests.
            </p>
          </div>
          <div style={{ color: '#8BC7A3' }} className="mt-6 flex items-center text-xs font-bold gap-1 group-hover:translate-x-1 transition-transform">
            <span>Browse Marketplace</span> <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        {onNavigateToDemand && (
          <div
            onClick={onNavigateToDemand}
            style={{ backgroundColor: '#12372A', borderColor: '#294237' }}
            className="border p-6 rounded-3xl shadow-sm cursor-pointer transition-all flex flex-col justify-between group hover:border-[#6FAF8A]"
          >
            <div>
              <div style={{ backgroundColor: '#1C3429', color: '#8BC7A3' }} className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all">
                <PlusCircle className="h-6 w-6" />
              </div>
              <h4 style={{ color: '#F1F5F2' }} className="text-lg font-extrabold">Post Biomass Demand</h4>
              <p style={{ color: '#B8C8BF' }} className="text-xs mt-1 leading-relaxed">
                Specify your plant tonnage targets, maximum price limits, and let Parali match suitable farmers.
              </p>
            </div>
            <div style={{ color: '#8BC7A3' }} className="mt-6 flex items-center text-xs font-bold gap-1 group-hover:translate-x-1 transition-transform">
              <span>Create Requirement</span> <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        )}

        {onNavigateToMatches && (
          <div
            onClick={onNavigateToMatches}
            style={{ backgroundColor: '#12372A', borderColor: '#294237' }}
            className="border p-6 rounded-3xl shadow-sm cursor-pointer transition-all flex flex-col justify-between group hover:border-[#6FAF8A]"
          >
            <div>
              <div style={{ backgroundColor: '#1C3429', color: '#8BC7A3' }} className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all">
                <Sparkles className="h-6 w-6" />
              </div>
              <h4 style={{ color: '#F1F5F2' }} className="text-lg font-extrabold">Matched Farmers</h4>
              <p style={{ color: '#B8C8BF' }} className="text-xs mt-1 leading-relaxed">
                Review automated compatibility scores (e.g. 94% Match) and confirm pickup contracts.
              </p>
            </div>
            <div style={{ color: '#8BC7A3' }} className="mt-6 flex items-center text-xs font-bold gap-1 group-hover:translate-x-1 transition-transform">
              <span>View Matches</span> <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>

      {/* Sourcing Impact Section */}
      <div className="bg-gradient-to-r from-forest-950 to-forest-900 text-white rounded-3xl p-8 shadow-lg mb-10 border border-forest-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <span className="text-[10px] font-black uppercase text-clay-300 bg-forest-800 px-3 py-1 rounded-full tracking-wider">
              Environmental Impact Metrics
            </span>
            <h3 className="text-2xl font-black text-white mt-2">
              Your Sourcing Impact
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              By procuring biomass directly from farmers, your business actively prevents stubble burning.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center bg-forest-900/90 border border-forest-700 p-4 rounded-2xl w-full md:w-auto">
            <div>
              <span className="text-2xl font-black text-white">{totalSourcedTonnes} t</span>
              <span className="text-[10px] font-bold text-slate-400 block mt-0.5">Residue Sourced</span>
            </div>
            <div>
              <span className="text-2xl font-black text-forest-400">{estimatedBurnsPrevented}</span>
              <span className="text-[10px] font-bold text-slate-400 block mt-0.5">Est. Burns Prevented</span>
            </div>
            <div>
              <span className="text-2xl font-black text-clay-300">₹{estimatedFarmerEarnings}</span>
              <span className="text-[10px] font-bold text-slate-400 block mt-0.5">Farmer Income Created</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sourcing Timeline / Active Contracts */}
      <div className="bg-white border border-forest-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-extrabold text-base text-forest-950 flex items-center gap-1.5">
            <Layers className="h-5 w-5 text-forest-600" /> Active Sourcing Contracts
          </h4>

          {onNavigateToRequests && (
            <button
              onClick={onNavigateToRequests}
              className="text-xs font-bold text-forest-700 hover:text-forest-950 underline"
            >
              View All Requests
            </button>
          )}
        </div>

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
