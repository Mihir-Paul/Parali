import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchResidueListings, calculateMatches, createPurchaseRequest } from '../services/marketplaceService';
import { BuyerDemandItem, ResidueMatchItem, ResidueListingItem } from '../types/marketplace';
import { Sparkles, MapPin, Calendar, CheckCircle2, ArrowRight, X, Send, Target } from 'lucide-react';

interface BuyerMatchesProps {
  activeDemand?: BuyerDemandItem | null;
  onNavigateToMarketplace?: () => void;
  onNavigateToRequests?: () => void;
}

export const BuyerMatches: React.FC<BuyerMatchesProps> = ({
  activeDemand,
  onNavigateToMarketplace,
  onNavigateToRequests
}) => {
  const { user, profile, buyerProfile } = useAuth();

  const [matches, setMatches] = useState<ResidueMatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Request modal state
  const [requestModalListing, setRequestModalListing] = useState<ResidueListingItem | null>(null);
  const [requestQty, setRequestQty] = useState<string>('5');
  const [pickupDatePref, setPickupDatePref] = useState<string>('');
  const [requestNote, setRequestNote] = useState<string>('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fallback demand if none passed
  const currentDemand: BuyerDemandItem = activeDemand || {
    id: 'd_active',
    buyer_id: user?.id || 'b1',
    company_name: buyerProfile?.business_name || profile?.full_name || 'GreenGrow Bio-Energy',
    buyer_type: buyerProfile?.buyer_type || 'mushroom_farm',
    crop_type: 'Rice',
    residue_type: 'Rice Straw',
    required_quantity_tonnes: 50,
    max_price_per_tonne: 1300,
    preferred_state: profile?.state || 'Punjab',
    preferred_district: profile?.district || 'Patiala',
    max_distance_km: buyerProfile?.procurement_radius_km || 50,
    status: 'Active',
    created_at: new Date().toISOString()
  };

  useEffect(() => {
    const loadAndMatch = async () => {
      setLoading(true);
      try {
        const listings = await fetchResidueListings();
        const calculated = calculateMatches(currentDemand, listings);
        setMatches(calculated);
      } catch (err) {
        console.error('Error calculating matches:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAndMatch();
  }, [activeDemand]);

  const openRequestModal = (listing: ResidueListingItem) => {
    setRequestModalListing(listing);
    setRequestQty(String(Math.min(listing.quantity, currentDemand.required_quantity_tonnes)));
    setPickupDatePref(listing.pickup_ready_date || new Date().toISOString().split('T')[0]);
    setRequestNote('');
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !requestModalListing) return;

    const requestedNum = parseFloat(requestQty);
    if (isNaN(requestedNum) || requestedNum <= 0 || requestedNum > requestModalListing.quantity) {
      alert(`Please enter a valid quantity up to ${requestModalListing.quantity} tonnes.`);
      return;
    }

    setSubmittingRequest(true);

    try {
      const totalAmount = requestedNum * requestModalListing.price_per_tonne;

      await createPurchaseRequest(user, {
        listing_id: requestModalListing.id,
        farmer_id: requestModalListing.farmer_id,
        demand_id: currentDemand.id,
        quantity_requested: requestedNum,
        offered_price_per_tonne: requestModalListing.price_per_tonne,
        total_amount: totalAmount,
        pickup_date_preference: pickupDatePref,
        note: requestNote
      });

      setRequestModalListing(null);
      setToastMessage(`Purchase request sent to ${requestModalListing.farmer_name}!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Error sending purchase request from matches:', err);
      alert('Failed to send purchase request.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 font-sans selection:bg-forest-200">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-forest-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-forest-700 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-forest-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-forest-700 mb-1">
            <Sparkles className="h-4 w-4 text-forest-600" /> Automated Matching Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-forest-950">
            Potential Supplier Matches
          </h1>
          <p className="text-xs md:text-sm text-forest-750 mt-1">
            Ranked crop residue listings matching your active biomass requirement.
          </p>
        </div>

        {onNavigateToRequests && (
          <button
            onClick={onNavigateToRequests}
            className="bg-forest-600 hover:bg-forest-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-sm transition-all"
          >
            Track Requests
          </button>
        )}
      </div>

      {/* Active Requirement Card Banner */}
      <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-forest-800 text-white rounded-3xl p-6 md:p-8 shadow-md mb-10 border border-forest-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-30 bg-forest-700 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] bg-forest-800 text-clay-300 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-forest-700">
              Active Requirement
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white mt-2">
              {currentDemand.required_quantity_tonnes} tonnes of {currentDemand.residue_type}
            </h2>
            <p className="text-xs text-cream-200 mt-1">
              Target Price: Max ₹{currentDemand.max_price_per_tonne}/tonne • Radius: Within {currentDemand.max_distance_km} km
            </p>
          </div>

          <div className="bg-forest-800 border border-forest-700 p-4 rounded-2xl text-xs space-y-1">
            <div className="flex justify-between gap-6 text-cream-200">
              <span>Entity:</span>
              <span className="font-bold text-white">{currentDemand.company_name}</span>
            </div>
            <div className="flex justify-between gap-6 text-cream-200">
              <span>Location:</span>
              <span className="font-bold text-white">{currentDemand.preferred_district}, {currentDemand.preferred_state}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Matched Listings Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-extrabold text-forest-950 flex items-center gap-2">
          <Target className="h-5 w-5 text-forest-600" /> Matched Farmer Listings ({matches.length})
        </h3>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-forest-100 p-6 rounded-3xl animate-pulse space-y-3">
                <div className="h-4 bg-forest-100 rounded w-1/4"></div>
                <div className="h-6 bg-forest-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white border border-forest-100 rounded-3xl p-12 text-center text-forest-750 font-semibold shadow-sm">
            No matching farmer listings found for this requirement.
            {onNavigateToMarketplace && (
              <div className="mt-4">
                <button
                  onClick={onNavigateToMarketplace}
                  className="bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl"
                >
                  Browse Marketplace
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const { listing, compatibility_score } = match;
              return (
                <div
                  key={match.id}
                  className="bg-white border border-forest-100 rounded-3xl p-6 shadow-sm hover:border-forest-300 hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black bg-forest-600 text-white px-3 py-1 rounded-full shadow-sm">
                        {compatibility_score}% Match
                      </span>
                      <span className="text-xs bg-forest-100 text-forest-800 font-extrabold px-2.5 py-0.5 rounded-full">
                        {listing.residue_type}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {listing.quality_grade}
                      </span>
                    </div>

                    <h4 className="text-lg font-extrabold text-forest-950">
                      Farmer {listing.farmer_name} • {listing.quantity} tonnes available
                    </h4>

                    <p className="text-xs text-forest-700 font-semibold flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-forest-500" />
                      {listing.pickup_location}, {listing.district}, {listing.state} ({listing.distance_km || 18} km away)
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-forest-100">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Listed Price</span>
                      <span className="text-base font-black text-forest-900">
                        ₹{listing.price_per_tonne} / tonne
                      </span>
                    </div>

                    <button
                      onClick={() => openRequestModal(listing)}
                      className="bg-forest-600 hover:bg-forest-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow transition-all w-full sm:w-auto"
                    >
                      Select & Request Quantity
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Request Modal */}
      {requestModalListing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-forest-100 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setRequestModalListing(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-extrabold text-forest-950 mb-1">
              Select & Request Residue
            </h2>
            <p className="text-xs text-forest-700 mb-6">
              Request quantity from farmer {requestModalListing.farmer_name} ({requestModalListing.quantity} tonnes available).
            </p>

            <form onSubmit={handleSendRequest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-forest-800 mb-1 uppercase text-[10px]">
                  Requested Quantity (Tonnes)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max={requestModalListing.quantity}
                  value={requestQty}
                  onChange={(e) => setRequestQty(e.target.value)}
                  className="w-full p-3 rounded-xl border border-forest-200 font-bold text-sm outline-none focus:ring-2 focus:ring-forest-500"
                  required
                />
              </div>

              <div className="bg-cream-50 p-4 rounded-2xl border border-forest-150 space-y-2">
                <div className="flex justify-between font-bold text-forest-900">
                  <span>Price per tonne:</span>
                  <span>₹{requestModalListing.price_per_tonne}</span>
                </div>
                <div className="flex justify-between font-black text-forest-950 text-sm pt-2 border-t border-forest-200">
                  <span>Estimated Total Amount:</span>
                  <span className="text-forest-700">
                    ₹{(parseFloat(requestQty) || 0) * requestModalListing.price_per_tonne}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-forest-800 mb-1 uppercase text-[10px]">
                  Preferred Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupDatePref}
                  onChange={(e) => setPickupDatePref(e.target.value)}
                  className="w-full p-3 rounded-xl border border-forest-200 font-bold outline-none focus:ring-2 focus:ring-forest-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-forest-100">
                <button
                  type="button"
                  onClick={() => setRequestModalListing(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="bg-forest-600 hover:bg-forest-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {submittingRequest ? 'Sending Request...' : 'Send Purchase Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
