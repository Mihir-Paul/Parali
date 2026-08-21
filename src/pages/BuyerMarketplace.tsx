import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchResidueListings, createPurchaseRequest } from '../services/marketplaceService';
import { ResidueListingItem, MarketplaceFilterState } from '../types/marketplace';
import { MapViewer } from '../components/MapViewer';
import {
  Search,
  Filter,
  RotateCw,
  X,
  CheckCircle2,
  Calendar,
  MapPin,
  IndianRupee,
  ShieldCheck,
  ArrowRight,
  List,
  Map,
  Info,
  Send,
  AlertCircle,
  Sprout
} from 'lucide-react';

interface BuyerMarketplaceProps {
  onNavigateToDemand?: () => void;
  onNavigateToRequests?: () => void;
}

export const BuyerMarketplace: React.FC<BuyerMarketplaceProps> = ({
  onNavigateToDemand,
  onNavigateToRequests
}) => {
  const { user } = useAuth();

  // Data & State
  const [listings, setListings] = useState<ResidueListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [highlightedFarmId, setHighlightedFarmId] = useState<string | undefined>(undefined);
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  // Modals state
  const [selectedDetailsListing, setSelectedDetailsListing] = useState<ResidueListingItem | null>(null);
  const [requestModalListing, setRequestModalListing] = useState<ResidueListingItem | null>(null);

  // Request form state
  const [requestQty, setRequestQty] = useState<string>('2');
  const [pickupDatePref, setPickupDatePref] = useState<string>('');
  const [requestNote, setRequestNote] = useState<string>('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<MarketplaceFilterState>({
    searchQuery: '',
    residueType: 'All',
    minQuantity: 0,
    maxQuantity: 0,
    maxPrice: 0,
    state: 'All',
    district: '',
    qualityGrade: 'All',
    sortBy: 'best_match'
  });

  // Load listings from database
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchResidueListings(filters);
      setListings(data);
    } catch (err) {
      console.error('Error fetching marketplace listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      residueType: 'All',
      minQuantity: 0,
      maxQuantity: 0,
      maxPrice: 0,
      state: 'All',
      district: '',
      qualityGrade: 'All',
      sortBy: 'best_match'
    });
  };

  // Flip card handler
  const toggleFlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedCardId((prev) => (prev === id ? null : id));
  };

  // Open Request Modal
  const openRequestModal = (listing: ResidueListingItem) => {
    setSelectedDetailsListing(null);
    setRequestModalListing(listing);
    setRequestQty(String(Math.min(listing.quantity, 2)));
    setPickupDatePref(listing.pickup_ready_date || new Date().toISOString().split('T')[0]);
    setRequestNote('');
  };

  // Submit Purchase Request
  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !requestModalListing) return;

    const requestedNum = parseFloat(requestQty);
    if (isNaN(requestedNum) || requestedNum <= 0 || requestedNum > requestModalListing.quantity) {
      alert(`Please enter a requested quantity between 0.1 and ${requestModalListing.quantity} tonnes.`);
      return;
    }

    setSubmittingRequest(true);

    try {
      const totalAmount = requestedNum * requestModalListing.price_per_tonne;

      await createPurchaseRequest(user, {
        listing_id: requestModalListing.id,
        farmer_id: requestModalListing.farmer_id,
        quantity_requested: requestedNum,
        offered_price_per_tonne: requestModalListing.price_per_tonne,
        total_amount: totalAmount,
        pickup_date_preference: pickupDatePref,
        note: requestNote
      });

      setRequestModalListing(null);
      setToastMessage(`Purchase request for ${requestedNum}t ${requestModalListing.residue_type} sent successfully!`);

      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Error submitting purchase request:', err);
      alert('Failed to send purchase request. Please try again.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 font-sans selection:bg-forest-200">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-forest-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-forest-700 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-forest-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner Header */}
      <div className="relative bg-gradient-to-r from-forest-950 via-forest-900 to-forest-800 text-white rounded-3xl p-6 md:p-10 mb-8 shadow-md border border-forest-800 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 opacity-20 bg-forest-700 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="max-w-2xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-clay-300 bg-forest-800 px-3 py-1 rounded-full border border-forest-700">
              B2B Biomass Marketplace
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-white mt-3 tracking-tight">
              Source agricultural residue directly from farmers.
            </h1>
            <p className="text-xs md:text-sm text-cream-200 mt-2 leading-relaxed font-medium">
              Find verified crop residue, compare available quantities, and create reliable biomass supply for your plant.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            {onNavigateToDemand && (
              <button
                onClick={onNavigateToDemand}
                className="bg-clay-600 hover:bg-clay-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-sm transition-all flex items-center gap-2"
              >
                Post Requirement <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {onNavigateToRequests && (
              <button
                onClick={onNavigateToRequests}
                className="bg-forest-800 hover:bg-forest-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl border border-forest-600 transition-all"
              >
                My Requests
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Filter Sidebar Panel */}
        <aside className="lg:col-span-3 bg-white border border-forest-100 p-5 rounded-3xl shadow-sm h-fit space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-forest-100">
            <h3 className="font-extrabold text-sm text-forest-950 flex items-center gap-2">
              <Filter className="h-4 w-4 text-forest-600" /> Filter Residue
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-[10px] text-forest-700 hover:text-forest-950 font-bold underline"
            >
              Clear All
            </button>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1.5">
              Search Keywords
            </label>
            <div className="relative">
              <Search className="h-4 w-4 text-forest-400 absolute left-3 top-3" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                placeholder="Crop, district, village..."
                className="w-full text-xs p-2.5 pl-9 rounded-xl border border-forest-200 focus:ring-2 focus:ring-forest-500 font-semibold outline-none"
              />
            </div>
          </div>

          {/* Crop / Residue Type */}
          <div>
            <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1.5">
              Residue Type
            </label>
            <select
              value={filters.residueType}
              onChange={(e) => setFilters({ ...filters, residueType: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-forest-200 bg-white font-bold text-forest-950 outline-none focus:ring-2 focus:ring-forest-500"
            >
              <option value="All">All Residues</option>
              <option value="Wheat">Wheat Straw (Tudi)</option>
              <option value="Rice">Rice / Paddy Straw</option>
              <option value="Maize">Maize Residue</option>
              <option value="Sugarcane">Sugarcane Trash</option>
              <option value="Cotton">Cotton Stalks</option>
            </select>
          </div>

          {/* Quantity Range */}
          <div>
            <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1.5">
              Quantity Available
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFilters({ ...filters, minQuantity: 0, maxQuantity: 5 })}
                className={`p-2 text-center rounded-xl text-xs font-bold border transition-all ${
                  filters.maxQuantity === 5 ? 'bg-forest-600 text-white border-forest-600' : 'bg-cream-50 border-forest-100 text-forest-800'
                }`}
              >
                1–5 tonnes
              </button>
              <button
                onClick={() => setFilters({ ...filters, minQuantity: 5, maxQuantity: 20 })}
                className={`p-2 text-center rounded-xl text-xs font-bold border transition-all ${
                  filters.minQuantity === 5 ? 'bg-forest-600 text-white border-forest-600' : 'bg-cream-50 border-forest-100 text-forest-800'
                }`}
              >
                5–20 tonnes
              </button>
            </div>
          </div>

          {/* Max Price Filter */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-bold text-forest-800 uppercase tracking-wider">
                Max Price (₹/tonne)
              </label>
              <span className="text-xs font-extrabold text-forest-950">
                {filters.maxPrice > 0 ? `₹${filters.maxPrice}` : 'Any Price'}
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="2500"
              step="50"
              value={filters.maxPrice || 2500}
              onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
              className="w-full accent-forest-600 cursor-pointer"
            />
          </div>

          {/* Location District */}
          <div>
            <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1.5">
              District Location
            </label>
            <input
              type="text"
              value={filters.district}
              onChange={(e) => setFilters({ ...filters, district: e.target.value })}
              placeholder="e.g. Sangrur, Patiala..."
              className="w-full text-xs p-2.5 rounded-xl border border-forest-200 font-semibold outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          {/* Quality Grade */}
          <div>
            <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1.5">
              Quality Grade
            </label>
            <div className="flex gap-2">
              {['All', 'Grade A', 'Grade B'].map((grade) => (
                <button
                  key={grade}
                  onClick={() => setFilters({ ...filters, qualityGrade: grade })}
                  className={`flex-1 p-2 rounded-xl text-xs font-bold border text-center transition-all ${
                    filters.qualityGrade === grade
                      ? 'bg-forest-600 text-white border-forest-600'
                      : 'bg-cream-50 border-forest-100 text-forest-800 hover:bg-forest-50'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Option */}
          <div>
            <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1.5">
              Sort Listings By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="w-full text-xs p-2.5 rounded-xl border border-forest-200 bg-white font-bold text-forest-950 outline-none focus:ring-2 focus:ring-forest-500"
            >
              <option value="best_match">Best Match</option>
              <option value="lowest_price">Lowest Price</option>
              <option value="highest_quantity">Highest Quantity</option>
              <option value="nearest_farm">Nearest Farm</option>
              <option value="recently_listed">Recently Listed</option>
            </select>
          </div>
        </aside>

        {/* Right Main Marketplace Section */}
        <main className="lg:col-span-9 flex flex-col gap-6">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-forest-100 p-4 rounded-3xl shadow-sm">
            <div>
              <h2 className="text-base font-extrabold text-forest-950">
                Available Biomass Residues ({listings.length})
              </h2>
              <p className="text-xs text-forest-700 mt-0.5">
                Showing active listings verified on the Parali platform.
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-cream-100 rounded-2xl p-1 border border-forest-200">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'list' ? 'bg-white text-forest-950 shadow-sm' : 'text-forest-700 hover:text-forest-950'
                }`}
              >
                <List className="h-4 w-4" /> Grid List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'map' ? 'bg-white text-forest-950 shadow-sm' : 'text-forest-700 hover:text-forest-950'
                }`}
              >
                <Map className="h-4 w-4" /> Map View
              </button>
            </div>
          </div>

          {/* Skeleton Loaders */}
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-forest-100 p-6 rounded-3xl animate-pulse space-y-4">
                  <div className="h-4 bg-forest-100 rounded w-1/3"></div>
                  <div className="h-6 bg-forest-100 rounded w-3/4"></div>
                  <div className="h-4 bg-forest-50 rounded w-1/2"></div>
                  <div className="h-10 bg-forest-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : viewMode === 'map' ? (
            <div className="bg-white border border-forest-100 rounded-3xl p-3 shadow-sm">
              <MapViewer
                showRoutes={false}
                highlightedFarmId={highlightedFarmId}
                onFarmClick={(farmId) => setHighlightedFarmId(farmId)}
              />
            </div>
          ) : listings.length === 0 ? (
            /* Empty Filter State */
            <div className="bg-white border border-forest-100 rounded-3xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-cream-100 text-forest-700 flex items-center justify-center mx-auto mb-4">
                <Sprout className="h-8 w-8 text-forest-700" />
              </div>
              <h3 className="text-lg font-bold text-forest-950">No residue listings match your current filters</h3>
              <p className="text-xs text-forest-700 max-w-md mx-auto mt-2 leading-relaxed">
                Try widening your price range, choosing "All" residue types, or clearing district filters.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-6 bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            /* Marketplace Grid with 3D Flip Card Effect */
            <div className="grid md:grid-cols-2 gap-6">
              {listings.map((item) => {
                const isFlipped = flippedCardId === item.id;
                return (
                  <div
                    key={item.id}
                    className="relative [perspective:1000px] h-[340px] group"
                    onMouseEnter={() => setHighlightedFarmId(item.farmer_id)}
                    onMouseLeave={() => setHighlightedFarmId(undefined)}
                  >
                    <div
                      className={`w-full h-full relative transition-transform duration-700 [transform-style:preserve-3d] ${
                        isFlipped ? '[transform:rotateY(180deg)]' : ''
                      }`}
                    >
                      {/* ============================================================ */}
                      {/* CARD FRONT SIDE */}
                      {/* ============================================================ */}
                      <div className="absolute inset-0 w-full h-full bg-white border border-forest-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-forest-300 transition-all [backface-visibility:hidden] flex flex-col justify-between">
                        <div>
                          {/* Card Header badges */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black bg-forest-100 text-forest-800 px-3 py-1 rounded-full border border-forest-200">
                              {item.residue_type}
                            </span>
                            <span className="text-[10px] font-extrabold bg-cream-100 text-forest-700 px-2.5 py-0.5 rounded-full">
                              {item.quality_grade}
                            </span>
                          </div>

                          <h3 className="text-lg font-extrabold text-forest-950 leading-tight">
                            {item.quantity} tonnes available
                          </h3>
                          <p className="text-xs text-forest-700 font-semibold mt-1 flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-forest-500 shrink-0" />
                            {item.district}, {item.state} {item.distance_km ? `(~${item.distance_km} km away)` : ''}
                          </p>

                          <div className="mt-4 pt-3 border-t border-forest-50 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Price / Tonne</span>
                              <span className="text-base font-black text-forest-900">₹{item.price_per_tonne}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Pickup Ready</span>
                              <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                                <Calendar className="h-3.5 w-3.5 text-forest-600" /> {item.pickup_ready_date}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Front Actions */}
                        <div className="flex items-center gap-2 pt-4 border-t border-forest-100">
                          <button
                            type="button"
                            onClick={(e) => toggleFlip(item.id, e)}
                            className="p-2.5 rounded-xl border border-forest-200 text-forest-700 hover:bg-forest-50 transition-all text-xs font-bold flex items-center gap-1"
                            title="Flip for additional details"
                          >
                            <RotateCw className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedDetailsListing(item)}
                            className="flex-1 bg-cream-50 hover:bg-cream-100 text-forest-900 border border-forest-200 text-xs font-extrabold py-2.5 rounded-xl transition-all text-center"
                          >
                            View Details
                          </button>

                          <button
                            type="button"
                            onClick={() => openRequestModal(item)}
                            className="flex-1 bg-forest-600 hover:bg-forest-700 text-white text-xs font-extrabold py-2.5 rounded-xl transition-all shadow-sm text-center"
                          >
                            Request Quantity
                          </button>
                        </div>
                      </div>

                      {/* ============================================================ */}
                      {/* CARD BACK SIDE (3D FLIP EFFECT) */}
                      {/* ============================================================ */}
                      <div className="absolute inset-0 w-full h-full bg-forest-950 text-cream-50 border border-forest-800 rounded-3xl p-6 shadow-xl [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center pb-3 border-b border-forest-800">
                            <span className="text-[10px] font-black uppercase text-clay-300 tracking-wider">
                              Additional Specs
                            </span>
                            <button
                              type="button"
                              onClick={(e) => toggleFlip(item.id, e)}
                              className="text-xs font-bold text-forest-300 hover:text-white flex items-center gap-1"
                            >
                              <RotateCw className="h-3 w-3" /> Back
                            </button>
                          </div>

                          <div className="space-y-3 mt-4 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Farmer:</span>
                              <span className="font-bold text-white">{item.farmer_name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Est. Baling & Transport:</span>
                              <span className="font-bold text-clay-300">₹{item.estimated_collection_cost || 300} / tonne</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Moisture Content:</span>
                              <span className="font-bold text-white">{item.moisture_pct || 12}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Farm Location:</span>
                              <span className="font-bold text-white">{item.pickup_location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Buyer Compatibility Rating:</span>
                              <span className="font-black text-forest-300">High Match</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-forest-800 flex gap-2">
                          <button
                            type="button"
                            onClick={() => openRequestModal(item)}
                            className="w-full bg-clay-600 hover:bg-clay-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow text-center"
                          >
                            Send Purchase Request
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: VIEW LISTING DETAILS */}
      {/* ============================================================ */}
      {selectedDetailsListing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-forest-100 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedDetailsListing(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-forest-100 text-forest-800 font-extrabold px-3 py-1 rounded-full">
                {selectedDetailsListing.residue_type}
              </span>
              <span className="text-xs bg-cream-100 text-forest-700 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-forest-600" /> Verified Listing
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-forest-950 mt-2">
              {selectedDetailsListing.quantity} tonnes available
            </h2>
            <p className="text-xs text-forest-700 font-semibold mt-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-forest-600" /> {selectedDetailsListing.pickup_location}, {selectedDetailsListing.district}, {selectedDetailsListing.state}
            </p>

            <div className="bg-cream-50 border border-forest-150 rounded-2xl p-4 my-5 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-forest-100">
                <span className="text-forest-600 font-semibold">Listing Price</span>
                <span className="font-black text-forest-950 text-sm">₹{selectedDetailsListing.price_per_tonne} / tonne</span>
              </div>
              <div className="flex justify-between py-1 border-b border-forest-100">
                <span className="text-forest-600 font-semibold">Quality Grade</span>
                <span className="font-extrabold text-forest-950">{selectedDetailsListing.quality_grade}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-forest-150">
                <span className="text-forest-600 font-semibold">Moisture Content</span>
                <span className="font-bold text-forest-900">{selectedDetailsListing.moisture_pct || 12}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-forest-150">
                <span className="text-forest-600 font-semibold">Pickup Ready Date</span>
                <span className="font-bold text-forest-900">{selectedDetailsListing.pickup_ready_date}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-forest-600 font-semibold">Farmer</span>
                <span className="font-extrabold text-forest-950">{selectedDetailsListing.farmer_name}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-forest-100">
              <button
                type="button"
                onClick={() => setSelectedDetailsListing(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => openRequestModal(selectedDetailsListing)}
                className="bg-forest-600 hover:bg-forest-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow transition-all"
              >
                Request This Residue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: REQUEST QUANTITY FORM */}
      {/* ============================================================ */}
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
              Send Purchase Request
            </h2>
            <p className="text-xs text-forest-700 mb-6">
              Request quantity for {requestModalListing.residue_type} ({requestModalListing.quantity} tonnes available).
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

              <div>
                <label className="block font-bold text-forest-800 mb-1 uppercase text-[10px]">
                  Additional Note / Logistics Message (Optional)
                </label>
                <textarea
                  rows={2}
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                  placeholder="e.g. Prefer pickup in morning hours..."
                  className="w-full p-3 rounded-xl border border-forest-200 font-semibold outline-none focus:ring-2 focus:ring-forest-500"
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
