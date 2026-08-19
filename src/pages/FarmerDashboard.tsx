import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../context/AuthContext';
import { fetchPurchaseRequests, updatePurchaseRequestStatus } from '../services/marketplaceService';
import { PurchaseRequestItem } from '../types/marketplace';
import { IndianRupee, Sprout, ShieldCheck, CheckCircle2, FileSpreadsheet, MapPin, XCircle, Clock } from 'lucide-react';

interface FarmerDashboardProps {
  onNavigateToSell: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ onNavigateToSell }) => {
  const { listings, acceptMatch, completePickup } = useAppStore();
  const { profile, farmerProfile, user } = useAuth();

  const [incomingRequests, setIncomingRequests] = useState<PurchaseRequestItem[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const farmerName = profile?.full_name || user?.user_metadata?.full_name || 'Ramesh Kumar';
  const primaryCrop = farmerProfile?.primary_crop || 'Wheat';
  const landArea = farmerProfile?.land_area_acres || 5;
  const estimatedTonnes = farmerProfile?.estimated_residue_tonnes || 10;
  const locationText = profile?.village ? `${profile.village}, ${profile.district}` : 'Sangrur, Punjab';

  const metrics = {
    earnings: 7450,
    divertedTonnes: estimatedTonnes > 0 ? Number(estimatedTonnes) : 6.3,
    burnsPrevented: Math.max(1, Math.round((estimatedTonnes || 6) * 0.8))
  };

  // Fetch incoming purchase requests from Supabase
  const loadIncomingRequests = async () => {
    setLoadingRequests(true);
    try {
      const data = await fetchPurchaseRequests(undefined, user?.id);
      setIncomingRequests(data);
    } catch (err) {
      console.error('Error loading farmer purchase requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadIncomingRequests();
  }, [user]);

  // Demo fallback request if none exist
  const displayRequests: PurchaseRequestItem[] = incomingRequests.length > 0 ? incomingRequests : [
    {
      id: 'req_demo_1',
      buyer_id: 'b1',
      buyer_name: 'GreenGrow Mushroom Farm',
      residue_type: `${primaryCrop} Straw`,
      quantity_requested: 3.0,
      offered_price_per_tonne: 1200,
      total_amount: 3600,
      pickup_date_preference: '2026-08-22',
      location: 'Rajpura, Punjab (18 km away)',
      status: 'Pending',
      created_at: new Date().toISOString()
    }
  ];

  // Active listing for user
  const rameshListing = listings.find((l) => l.farmerId === 'f1' || l.farmerId === 'f_new' || l.farmerId === profile?.id);

  const getTimelineStep = (status: string) => {
    switch (status) {
      case 'Listed': return 1;
      case 'Matched': return 2;
      case 'Confirmed': return 3;
      case 'Pickup': return 4;
      case 'Paid': return 5;
      default: return 0;
    }
  };

  const timelineStep = rameshListing ? getTimelineStep(rameshListing.status) : 0;

  // Accept Purchase Request Handler
  const handleAcceptRequest = async (request: PurchaseRequestItem) => {
    try {
      await updatePurchaseRequestStatus(request.id, 'Confirmed');

      // Update Zustand state for demo flow
      if (rameshListing) {
        acceptMatch(rameshListing.id);
      }

      setIncomingRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, status: 'Confirmed' } : r))
      );

      setActionSuccessMsg(`Offer from ${request.buyer_name || 'Buyer'} accepted! Pickup contract generated.`);
      setTimeout(() => setActionSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Error accepting request:', err);
    }
  };

  // Reject Purchase Request Handler
  const handleRejectRequest = async (request: PurchaseRequestItem) => {
    try {
      await updatePurchaseRequestStatus(request.id, 'Rejected');
      setIncomingRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, status: 'Rejected' } : r))
      );
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans selection:bg-forest-200">
      
      {/* Action Success Toast Banner */}
      {actionSuccessMsg && (
        <div className="bg-forest-900 text-white p-4 rounded-2xl mb-6 shadow-lg border border-forest-700 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-forest-400 shrink-0" />
          <span className="text-xs font-bold">{actionSuccessMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-forest-600 mb-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{locationText} • {landArea} Acres ({primaryCrop})</span>
          </div>
          <h2 className="text-3xl font-extrabold text-forest-950">
            Good morning, {farmerName} 👋
          </h2>
          <p className="text-sm text-forest-700 mt-1">
            Here is what's happening with your agricultural residue listings.
          </p>
        </div>
        <button
          onClick={onNavigateToSell}
          className="bg-forest-600 hover:bg-forest-700 text-white font-extrabold px-6 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2"
        >
          <Sprout className="h-4 w-4" /> Sell Crop Residue
        </button>
      </div>

      {/* 3D-effect Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white border border-forest-100 p-6 rounded-3xl shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-forest-600 uppercase tracking-wider">Total Earnings</span>
            <div className="p-2.5 bg-forest-50 text-forest-600 rounded-xl"><IndianRupee className="h-4 w-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-forest-950">₹{metrics.earnings}</h3>
          <p className="text-[10px] text-forest-500 font-semibold mt-1">↑ 18.4% from last harvest</p>
        </div>

        <div className="bg-white border border-forest-100 p-6 rounded-3xl shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-forest-600 uppercase tracking-wider">Est. Season Residue</span>
            <div className="p-2.5 bg-forest-50 text-forest-600 rounded-xl"><Sprout className="h-4 w-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-forest-950">
            {metrics.divertedTonnes.toFixed(1)} tonnes
          </h3>
          <p className="text-[10px] text-forest-500 font-semibold mt-1">{primaryCrop} Straw</p>
        </div>

        <div className="bg-white border border-forest-100 p-6 rounded-3xl shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-forest-600 uppercase tracking-wider">Active Requests</span>
            <div className="p-2.5 bg-forest-50 text-forest-600 rounded-xl"><FileSpreadsheet className="h-4 w-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-forest-950">{displayRequests.length} Buyer Offers</h3>
          <p className="text-[10px] text-forest-500 font-semibold mt-1">Matching bio-energy factories</p>
        </div>

        <div className="bg-white border border-forest-100 p-6 rounded-3xl shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-forest-600 uppercase tracking-wider">Burning Avoided</span>
            <div className="p-2.5 bg-forest-50 text-forest-600 rounded-xl"><ShieldCheck className="h-4 w-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-forest-950">{(metrics.divertedTonnes * 1.5).toFixed(1)} tCO₂e</h3>
          <p className="text-[10px] text-forest-500 font-semibold mt-1">Prevented from stubble fires</p>
        </div>
      </div>

      {/* Central "Your Next Pickup" Card */}
      {rameshListing && rameshListing.status !== 'Paid' ? (
        <div className="bg-white border-2 border-forest-200 rounded-3xl p-8 mb-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-forest-50 rounded-full filter blur-2xl opacity-40"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <span className="text-[10px] bg-forest-100 text-forest-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Residue status: {rameshListing.status}
              </span>
              <h3 className="text-2xl font-extrabold text-forest-950 mt-2">
                Pickup Schedule for {rameshListing.quantity} tonnes {rameshListing.cropType} Straw
              </h3>
            </div>

            {rameshListing.status === 'Confirmed' && (
              <div className="flex items-center gap-4 bg-forest-50/80 border border-forest-100 p-4 rounded-2xl">
                <span className="text-2xl">🚛</span>
                <div>
                  <h4 className="font-extrabold text-xs text-forest-900 leading-none">Truck #PB-08-AX-2411</h4>
                  <p className="text-[10px] text-forest-600 mt-1">Arriving today at 10:40 AM (2.8 km away)</p>
                </div>
              </div>
            )}
          </div>

          {/* Progress Timeline */}
          <div className="relative flex items-center justify-between w-full mt-6 mb-4">
            <div className="absolute left-0 right-0 h-1 bg-slate-100 top-1/2 -translate-y-1/2 z-0"></div>
            <div
              className="absolute left-0 h-1 bg-forest-600 top-1/2 -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${((timelineStep - 1) / 4) * 100}%` }}
            ></div>

            {['Listed', 'Matched', 'Confirmed', 'Pickup', 'Paid'].map((stepName, i) => {
              const stepIndex = i + 1;
              const isActive = timelineStep >= stepIndex;
              const isCurrent = timelineStep === stepIndex;

              return (
                <div key={stepName} className="relative z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-forest-600 border-forest-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-400'
                  } ${isCurrent ? 'ring-4 ring-forest-100 scale-110' : ''}`}>
                    {isActive ? '✓' : stepIndex}
                  </div>
                  <span className={`text-[10px] font-bold mt-2 uppercase tracking-wide ${
                    isActive ? 'text-forest-900' : 'text-slate-400'
                  }`}>
                    {stepName}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Prompt to mark pickup complete */}
          {rameshListing.status === 'Confirmed' && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => completePickup(rameshListing.id)}
                className="bg-clay-600 hover:bg-clay-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" /> Confirm Pickup & Receive Payment
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-forest-100 rounded-3xl p-12 text-center shadow-sm mb-10">
          <div className="w-16 h-16 rounded-full bg-cream-100 text-cream-700 flex items-center justify-center mx-auto mb-6 text-2xl">🌾</div>
          <h3 className="text-xl font-bold text-forest-950">No active residue listings</h3>
          <p className="text-sm text-forest-700 max-w-sm mx-auto mt-2">
            Earn money from crop stubble rather than burning it. AI valuations take less than a minute.
          </p>
          <button
            onClick={onNavigateToSell}
            className="mt-6 bg-forest-600 hover:bg-forest-700 text-white font-bold px-6 py-3 rounded-xl transition-all"
          >
            Create Your First Listing
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* INCOMING BUYER PURCHASE REQUESTS SECTION */}
      {/* ============================================================ */}
      <div className="bg-white border border-forest-100 rounded-3xl p-6 shadow-sm mb-10">
        <h4 className="font-extrabold text-base text-forest-950 mb-4 flex items-center gap-2">
          <span>📨</span> Incoming Buyer Purchase Requests
        </h4>

        <div className="grid md:grid-cols-2 gap-4">
          {displayRequests.map((req) => (
            <div
              key={req.id}
              className="border border-forest-150 bg-cream-50/50 p-5 rounded-2xl hover:border-forest-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-forest-700 bg-forest-100 px-2.5 py-0.5 rounded-full">
                      {req.residue_type || 'Crop Residue'}
                    </span>
                    <h5 className="font-extrabold text-sm text-forest-950 mt-1.5">
                      {req.buyer_name || 'Verified Biomass Buyer'}
                    </h5>
                  </div>

                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    req.status === 'Confirmed' ? 'bg-forest-600 text-white' :
                    req.status === 'Rejected' ? 'bg-clay-200 text-clay-800' :
                    'bg-clay-100 text-clay-800'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <p className="text-xs text-forest-600 mt-2 font-medium">
                  {req.location || 'Punjab Hub'}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-forest-100/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Requested Quantity</span>
                    <span className="text-sm font-extrabold text-forest-900">{req.quantity_requested} tonnes</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Offer Rate</span>
                    <span className="text-sm font-extrabold text-forest-900">₹{req.offered_price_per_tonne} / tonne</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-[10px] text-forest-700 font-bold">
                  Total Contract Value: <span className="text-forest-950 font-black text-xs">₹{req.total_amount || req.quantity_requested * req.offered_price_per_tonne}</span>
                </div>
              </div>

              {/* Action Buttons for Farmer */}
              {req.status === 'Pending' ? (
                <div className="flex gap-2 mt-5 pt-3 border-t border-forest-100">
                  <button
                    onClick={() => handleAcceptRequest(req)}
                    className="flex-1 bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Accept Offer
                  </button>
                  <button
                    onClick={() => handleRejectRequest(req)}
                    className="bg-clay-100 hover:bg-clay-200 text-clay-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-clay-300 transition-all flex items-center gap-1"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Decline
                  </button>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-forest-100 text-center text-xs font-bold text-forest-800">
                  ✓ Request {req.status}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
