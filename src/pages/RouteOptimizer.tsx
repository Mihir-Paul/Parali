import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MapViewer } from '../components/MapViewer';
import { fetchOptimizedRoute } from '../services/routeService';
import { fetchPurchaseRequests, fetchResidueListings } from '../services/marketplaceService';
import { fetchAcceptedSuppliersForRoute } from '../services/purchaseRequestService';
import { OptimizeRouteResponse, VehicleRoute, FarmPickupInput } from '../types/route';
import { 
  Compass, 
  Truck, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  Layers,
  TrendingDown, 
  ChevronRight, 
  MapPin, 
  Sparkles,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

interface RouteOptimizerProps {
  onNavigateToMatches?: () => void;
}

export const RouteOptimizer: React.FC<RouteOptimizerProps> = () => {
  const [routeData, setRouteData] = useState<OptimizeRouteResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState<number | null>(null); // null = All trucks
  const [acceptedFarmsCount, setAcceptedFarmsCount] = useState<number>(0);
  const [lastFingerprint, setLastFingerprint] = useState<string>('');
  const [isStale, setIsStale] = useState<boolean>(false);

  // Load route data on component mount
  const loadRouteOptimization = async () => {
    setLoading(true);
    try {
      // 1. Fetch strictly accepted suppliers from Supabase purchase_requests
      let farmPickups = await fetchAcceptedSuppliersForRoute();

      // If database returned empty, fallback to accepted requests from marketplaceService
      if (farmPickups.length === 0) {
        const requests = await fetchPurchaseRequests();
        const listings = await fetchResidueListings();
        const acceptedRequests = requests.filter(r => (r.status as string) === 'Accepted' || r.status === 'Confirmed');

        farmPickups = acceptedRequests.map((req, index) => {
          const listing = listings.find(l => l.id === req.listing_id);
          return {
            farmer_id: req.farmer_id || `farmer_${index + 1}`,
            farmer_name: req.farmer_name || `Supplier ${index + 1}`,
            listing_id: req.listing_id || `listing_${index + 1}`,
            purchase_request_id: req.id,
            latitude: listing?.latitude || (30.31 + (index * 0.04)),
            longitude: listing?.longitude || (76.35 + (index * 0.05)),
            accepted_quantity_tonnes: req.quantity_requested || 5.0,
            residue_type: listing?.residue_type || 'Rice Straw',
            price_per_tonne: req.offered_price_per_tonne || 1100
          };
        });
      }

      setAcceptedFarmsCount(farmPickups.length);

      const currentFingerprint = farmPickups.map(f => f.purchase_request_id).sort().join('|');
      if (lastFingerprint && lastFingerprint !== currentFingerprint) {
        setIsStale(true);
      } else {
        setIsStale(false);
      }
      setLastFingerprint(currentFingerprint);

      // 2. Call backend optimize-route service
      const res = await fetchOptimizedRoute({
        buyer_demand_id: 'demand_active',
        buyer_depot: {
          buyer_id: 'b_demo',
          company_name: 'GreenGrow Bio-Energy Plant',
          latitude: 30.3400,
          longitude: 76.3800
        },
        farms: farmPickups.length > 0 ? farmPickups : undefined,
        vehicle_capacity_tonnes: 15.0,
        vehicle_count: 2,
        cost_per_km: 20.0
      });

      setRouteData(res);
    } catch (err) {
      console.error('Error loading route optimization:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRouteOptimization();
  }, []);

  const handleRunOptimizer = () => {
    loadRouteOptimization();
  };

  const activeRoutes: VehicleRoute[] = routeData?.routes || [];
  const displayedRoutes = selectedVehicleIndex === null 
    ? activeRoutes 
    : activeRoutes.filter(r => r.vehicle_index === selectedVehicleIndex);

  const totalFarmsCount = activeRoutes.reduce((acc, r) => acc + r.stops.filter(s => s.type === 'farm').length, 0);
  const totalTonnage = routeData?.total_quantity_tonnes || 0;
  const totalDistanceKm = routeData?.total_distance_km || 0;
  const totalDurationMin = routeData?.total_duration_minutes || 0;
  const hours = Math.floor(totalDurationMin / 60);
  const mins = Math.round(totalDurationMin % 60);

  const baseline = routeData?.baseline;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 font-sans">
      
      {/* Stale Supplier Set Warning Banner */}
      {isStale && (
        <div className="bg-ember-600 text-white p-4 rounded-card mb-6 shadow-card border border-ember-600 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-5 w-5 text-white shrink-0" />
            <span>Supplier set changed — accepted requests modified since last route solve.</span>
          </div>
          <button
            onClick={handleRunOptimizer}
            className="bg-white text-ink-900 font-bold px-4 py-1.5 rounded-card hover:bg-paper-50 transition-all"
          >
            Recalculate route
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-card text-[10px] font-mono font-medium uppercase tracking-wide bg-pine-100 text-pine-700">
              OR-Tools Logistics Engine
            </span>
            <span className="px-2 py-0.5 rounded-card text-[10px] font-mono text-ink-500 bg-paper-50 border border-line-200 uppercase">
              Multi-depot CVRP
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-ink-900">Collection route optimizer</h2>
          <p className="text-xs text-ink-500 mt-0.5">
            Capacitated vehicle routing solved with OR-Tools and OpenRouteService road network directions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadRouteOptimization}
            disabled={loading}
            className="p-2 border border-line-200 hover:bg-paper-50 rounded-card text-xs font-medium text-ink-900 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 text-pine-700 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={handleRunOptimizer}
            disabled={loading || acceptedFarmsCount === 0}
            className={`font-semibold px-4 py-2 rounded-card shadow-card transition-all text-xs flex items-center gap-1.5 ${
              acceptedFarmsCount > 0
                ? 'bg-pine-900 hover:bg-pine-700 text-white cursor-pointer'
                : 'bg-paper-50 text-ink-500 border border-line-200 cursor-not-allowed'
            }`}
          >
            <Play className="h-3.5 w-3.5 fill-white" /> Recalculate routes
          </button>
        </div>
      </div>

      {/* Map-First Split View Container */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Dominant WebGL Route Map Column (7/12) */}
        <div className="lg:col-span-7 bg-surface-0 border border-line-200 rounded-card shadow-card overflow-hidden">
          <div className="p-3 bg-paper-50 border-b border-line-200 flex justify-between items-center text-xs">
            <span className="font-display font-bold text-ink-900 flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-pine-700" /> Dispatch Spatial Routing Canvas
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <button
                onClick={() => setSelectedVehicleIndex(null)}
                className={`px-2 py-0.5 rounded-card border ${
                  selectedVehicleIndex === null ? 'bg-pine-900 text-white border-pine-900' : 'bg-surface-0 text-ink-500 border-line-200'
                }`}
              >
                All trucks
              </button>
              {activeRoutes.map((r) => (
                <button
                  key={r.vehicle_index}
                  onClick={() => setSelectedVehicleIndex(r.vehicle_index)}
                  className={`px-2 py-0.5 rounded-card border ${
                    selectedVehicleIndex === r.vehicle_index ? 'bg-pine-900 text-white border-pine-900' : 'bg-surface-0 text-ink-500 border-line-200'
                  }`}
                >
                  Truck {r.vehicle_index + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[520px] relative">
            <MapViewer
              routeData={routeData}
              selectedVehicleIndex={selectedVehicleIndex}
              showHotspots={false}
              showRoutes={true}
            />
          </div>
        </div>

        {/* Right Docked Route Telemetry & Sequences Column (5/12) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Metrics Overview Card */}
          <div className="bg-surface-0 border border-line-200 rounded-card p-5 shadow-card">
            <h3 className="text-sm font-display font-bold text-ink-900 mb-3 flex items-center justify-between">
              <span>Optimization Telemetry</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-card bg-pine-100 text-pine-700">
                OR-Tools Engine
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-paper-50 rounded-card border border-line-200">
                <span className="text-[10px] font-sans text-ink-500 block uppercase">Total distance</span>
                <span className="text-base font-bold text-ink-900">{totalDistanceKm.toFixed(1)} km</span>
              </div>

              <div className="p-3 bg-paper-50 rounded-card border border-line-200">
                <span className="text-[10px] font-sans text-ink-500 block uppercase">Est. duration</span>
                <span className="text-base font-bold text-ink-900">{hours > 0 ? `${hours}h ` : ''}{mins}m</span>
              </div>

              <div className="p-3 bg-paper-50 rounded-card border border-line-200">
                <span className="text-[10px] font-sans text-ink-500 block uppercase">Farms collected</span>
                <span className="text-base font-bold text-ink-900">{totalFarmsCount} farms</span>
              </div>

              <div className="p-3 bg-paper-50 rounded-card border border-line-200">
                <span className="text-[10px] font-sans text-ink-500 block uppercase">Payload biomass</span>
                <span className="text-base font-bold text-pine-700">{totalTonnage.toFixed(1)} t</span>
              </div>
            </div>

            {/* Baseline comparison callout */}
            {baseline && (
              <div className="mt-4 pt-3 border-t border-line-200 text-xs flex justify-between items-center text-ink-500 font-mono">
                <span>Distance saved vs unoptimized:</span>
                <span className="font-bold text-pine-700 font-sans flex items-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5" />
                  {baseline.distance_saved_km.toFixed(1)} km ({baseline.savings_pct ? baseline.savings_pct.toFixed(0) : 0}%)
                </span>
              </div>
            )}
          </div>

          {/* Vehicle Stops Sequence Breakdown */}
          <div className="bg-surface-0 border border-line-200 rounded-card p-5 shadow-card max-h-[380px] overflow-y-auto space-y-4">
            <h3 className="text-sm font-display font-bold text-ink-900 flex items-center gap-2">
              <Truck className="h-4 w-4 text-pine-700" /> Fleet Pickup Sequence
            </h3>

            {displayedRoutes.length === 0 ? (
              <p className="text-xs text-ink-500 font-mono text-center py-6">No active vehicle routes computed.</p>
            ) : (
              displayedRoutes.map((route) => (
                <div key={route.vehicle_index} className="border border-line-200 rounded-card p-3 bg-paper-50 text-xs space-y-2">
                  <div className="flex justify-between items-center border-b border-line-200 pb-2">
                    <span className="font-bold text-ink-900 flex items-center gap-1.5 font-sans">
                      Vehicle #{route.vehicle_index + 1}
                    </span>
                    <span className="font-mono text-[10px] text-ink-500">
                      {route.total_quantity_tonnes}t / {route.distance_km.toFixed(1)} km
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 font-mono text-[11px]">
                    {route.stops.map((stop, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-ink-900">
                        <span className="w-4 h-4 rounded-full bg-surface-0 border border-line-200 flex items-center justify-center text-[9px] font-bold text-ink-500 shrink-0">
                          {stop.sequence}
                        </span>
                        <span className="truncate">
                          {stop.type === 'depot' ? 'Depot Hub' : stop.name || `Farm ${stop.sequence}`}
                        </span>
                        {stop.quantity_tonnes && stop.quantity_tonnes > 0 ? (
                          <span className="ml-auto text-[10px] text-pine-700 font-semibold shrink-0">+{stop.quantity_tonnes}t</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
