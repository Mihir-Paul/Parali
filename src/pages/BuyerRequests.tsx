import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchPurchaseRequests } from '../services/marketplaceService';
import { PurchaseRequestItem } from '../types/marketplace';
import { Clock, CheckCircle2, XCircle, ShoppingBag, ArrowLeft, Calendar, MapPin } from 'lucide-react';

interface BuyerRequestsProps {
  onBackToMarketplace?: () => void;
}

export const BuyerRequests: React.FC<BuyerRequestsProps> = ({ onBackToMarketplace }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PurchaseRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const loadRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchPurchaseRequests(user.id);
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
      status: 'Confirmed',
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const filteredRequests = displayRequests.filter((r) => {
    if (statusFilter === 'All') return true;
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

        {/* Filter Status Tabs */}
        <div className="flex bg-white rounded-2xl p-1.5 border border-forest-100 shadow-sm gap-1">
          {['All', 'Pending', 'Confirmed', 'Completed'].map((st) => (
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
                    req.status === 'Confirmed' ? 'bg-forest-100 text-forest-800 border border-forest-300' :
                    req.status === 'Pending' ? 'bg-clay-100 text-clay-800 border border-clay-300' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    Status: {req.status}
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
                  {req.location && <span>• 📍 {req.location}</span>}
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
