import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchBuyerPurchaseRequests } from '../services/purchaseRequestService';
import { PurchaseRequestItem } from '../types/marketplace';
import { Clock, CheckCircle2, XCircle, ShoppingBag, ArrowLeft, Calendar, MapPin, Compass } from 'lucide-react';

interface BuyerRequestsProps {
  onBackToMarketplace?: () => void;
  onNavigateToOptimizer?: () => void;
}

export const BuyerRequests: React.FC<BuyerRequestsProps> = ({ onBackToMarketplace, onNavigateToOptimizer }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PurchaseRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchBuyerPurchaseRequests(user?.id);
      setRequests(data);
    } catch (err) {
      console.error('Error fetching purchase requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  // Seed items if none exist yet for demonstration
  const displayRequests: PurchaseRequestItem[] = requests.length > 0 ? requests : [
    {
      id: 'req_101',
      buyer_id: user?.id || 'b1',
      listing_id: 'seed_l1',
      farmer_name: 'Gurpreet Singh',
      crop_type: 'Wheat',
      residue_type: 'Wheat Straw',
      quantity_requested: 2.0,
      offered_price_per_tonne: 1150,
      total_amount: 2300,
      pickup_date_preference: '2026-08-22',
      location: 'Barnala, Punjab',
      status: 'Pending',
      created_at: new Date().toISOString()
    },
    {
      id: 'req_102',
      buyer_id: user?.id || 'b1',
      listing_id: 'seed_l2',
      farmer_name: 'Baldev Singh',
      crop_type: 'Rice',
      residue_type: 'Rice Straw Bales',
      quantity_requested: 14.0,
      offered_price_per_tonne: 950,
      total_amount: 13300,
      pickup_date_preference: '2026-08-24',
      location: 'Bathinda, Punjab',
      status: 'Accepted',
      accepted_at: new Date(Date.now() - 86400000).toISOString(),
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const acceptedCount = displayRequests.filter(r => r.status === 'Accepted' || r.status === 'Confirmed').length;

  const filteredRequests = displayRequests.filter((r) => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Accepted') return r.status === 'Accepted' || r.status === 'Confirmed';
    if (statusFilter === 'Declined') return r.status === 'Declined' || r.status === 'Rejected';
    return r.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 font-sans selection:bg-forest-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          {onBackToMarketplace && (
            <button
              onClick={onBackToMarketplace}
              className="flex items-center gap-1.5 text-xs text-forest-800 hover:text-forest-950 font-extrabold mb-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Marketplace
            </button>
          )}
          <h1 className="text-2xl md:text-3xl font-black text-forest-950">
            Purchase Requests Tracking
          </h1>
          <p className="text-xs md:text-sm text-forest-750 mt-1">
            Monitor the status of residue purchase requests sent to farmers.
          </p>
        </div>

        {/* Action & Filter Status Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {onNavigateToOptimizer && (
            <button
              onClick={onNavigateToOptimizer}
              disabled={acceptedCount === 0}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 ${
                acceptedCount > 0
                  ? 'bg-forest-600 hover:bg-forest-700 text-white cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
              title={acceptedCount === 0 ? 'No accepted suppliers yet.' : 'Optimize pickup route for accepted suppliers'}
            >
              <Compass className="h-4 w-4" />
              {acceptedCount > 0 ? `Optimize Pickup Route (${acceptedCount})` : 'No accepted suppliers yet'}
            </button>
          )}

          <div className="flex bg-white rounded-2xl p-1.5 border border-forest-100 shadow-sm gap-1">
            {['All', 'Pending', 'Accepted', 'Declined', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-forest-600 text-white shadow-sm'
                    : 'text-forest-800 hover:bg-forest-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-forest-100 p-8 rounded-3xl animate-pulse">
            <div className="h-4 bg-forest-100 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-forest-50 rounded"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white border border-forest-100 rounded-3xl p-12 text-center text-forest-750 font-semibold shadow-sm">
            No purchase requests found in "{statusFilter}" status.
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-forest-100 rounded-3xl p-6 shadow-sm hover:border-forest-300 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    req.status === 'Accepted' || req.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                    req.status === 'Declined' || req.status === 'Rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                    req.status === 'Pending' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {req.status === 'Accepted' || req.status === 'Confirmed' ? 'Accepted ✓' :
                     req.status === 'Declined' || req.status === 'Rejected' ? 'Declined ✗' :
                     req.status}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Request ID: #{req.id.substring(0, 8)}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-forest-950">
                  {req.quantity_requested} tonnes of {req.residue_type || 'Crop Residue'}
                </h3>

                <p className="text-xs text-forest-700 font-semibold flex items-center gap-3">
                  <span>Farmer: <strong>{req.farmer_name || 'Verified Farmer'}</strong></span>
                  {req.location && (
                    <span className="flex items-center gap-1">
                      • <MapPin className="h-3.5 w-3.5 text-forest-600" /> {req.location}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-forest-100">
                <div className="text-left md:text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Offered Rate</span>
                  <span className="text-xs font-bold text-slate-700">₹{req.offered_price_per_tonne} / tonne</span>
                  <span className="text-sm font-black text-forest-900 block mt-0.5">Total: ₹{req.total_amount}</span>
                </div>

                <div className="text-xs text-forest-800 font-bold bg-cream-50 p-3 rounded-2xl border border-forest-150">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-forest-600" />
                    <span>Pickup Pref: {req.pickup_date_preference || 'Flexible'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
