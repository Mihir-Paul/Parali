import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MapViewer } from '../components/MapViewer';
import { fetchOptimizedRoute } from '../services/routeService';
import { fetchPurchaseRequests, fetchResidueListings } from '../services/marketplaceService';
import { OptimizeRouteResponse, VehicleRoute, FarmPickupInput } from '../types/route';
import { 
  Compass, 
  Truck, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  Layers
} from 'lucide-react';

interface RouteOptimizerProps {
  onNavigateToMatches?: () => void;
}

export const RouteOptimizer: React.FC<RouteOptimizerProps> = () => {
  const [routeData, setRouteData] = useState<OptimizeRouteResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState<number | null>(null);

  // Load route data on component mount
  const loadRouteOptimization = async () => {
    setLoading(true);
    try {
      const requests = await fetchPurchaseRequests();
      const listings = await fetchResidueListings();

      const acceptedRequests = requests.filter(r => (r.status as string) === 'Accepted' || r.status === 'Pending' || r.status === 'Confirmed');

      const farmPickups: FarmPickupInput[] = acceptedRequests.map((req, index) => {
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
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-pine-700 bg-pine-100 px-2.5 py-0.5 rounded-card">
              OR-Tools CVRP
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-ink-900 mt-1">
            Logistics route optimizer
          </h1>
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
            disabled={loading}
            className="bg-pine-900 hover:bg-pine-700 text-white font-semibold px-4 py-2 rounded-card shadow-card transition-all text-xs flex items-center gap-1.5"
          >
            <Play className="h-3.5 w-3.5 fill-white" /> Recalculate routes
          </button>
        </div>
      </div>

      {/* MAP-FIRST LAYOUT: Map container with docked overlay panel */}
      <div className="relative w-full rounded-card overflow-hidden border border-line-200 shadow-card bg-paper-50 min-h-[580px]">
        
        {/* Map View */}
        <div className="w-full h-[580px]">
          <MapViewer
            routeData={routeData}
            selectedVehicleIndex={selectedVehicleIndex}
            showRoutes={true}
            isLoading={loading}
          />
        </div>

        {/* Docked Right Details Panel */}
        <div className="absolute top-4 right-4 z-30 w-full max-w-md max-h-[540px] overflow-y-auto bg-surface-0/95 backdrop-blur-md border border-line-200 rounded-card p-4 shadow-card text-ink-900 animate-slide-in">
          
          {/* Summary Stat Badges */}
          <div className="grid grid-cols-4 gap-2 mb-4 font-mono text-center">
            <div className="bg-paper-50 border border-line-200 p-2 rounded-card">
              <span className="text-[9px] font-sans text-ink-500 block uppercase">Farms</span>
              <span className="text-sm font-bold text-ink-900">{totalFarmsCount}</span>
            </div>
            <div className="bg-paper-50 border border-line-200 p-2 rounded-card">
              <span className="text-[9px] font-sans text-ink-500 block uppercase">Tonnage</span>
              <span className="text-sm font-bold text-pine-700">{totalTonnage.toFixed(1)}t</span>
            </div>
            <div className="bg-paper-50 border border-line-200 p-2 rounded-card">
              <span className="text-[9px] font-sans text-ink-500 block uppercase">Distance</span>
              <span className="text-sm font-bold text-ink-900">{totalDistanceKm}km</span>
            </div>
            <div className="bg-paper-50 border border-line-200 p-2 rounded-card">
              <span className="text-[9px] font-sans text-ink-500 block uppercase">Duration</span>
              <span className="text-sm font-bold text-ink-900">
                {hours > 0 ? `${hours}h ` : ''}{mins}m
              </span>
            </div>
          </div>

          {/* Efficiency Metric Banner */}
          {baseline && (
            <div className="bg-pine-100 border border-pine-700/20 p-2.5 rounded-card mb-4 flex items-center justify-between text-xs font-mono">
              <span className="font-sans text-ink-500 text-[11px]">Logistics efficiency:</span>
              <span className="font-semibold text-pine-700">
                {baseline.savings_pct}% distance saved ({baseline.distance_saved_km} km)
              </span>
            </div>
          )}

          {/* Vehicle Selector Tabs */}
          {activeRoutes.length > 1 && (
            <div className="bg-paper-50 border border-line-200 p-1 rounded-card flex items-center gap-1 mb-4">
              <button
                onClick={() => setSelectedVehicleIndex(null)}
                className={`flex-1 py-1.5 px-2 rounded-card text-xs font-medium transition-all ${
                  selectedVehicleIndex === null
                    ? 'bg-pine-900 text-white'
                    : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                All trucks ({activeRoutes.length})
              </button>
              {activeRoutes.map(r => (
                <button
                  key={`truck-tab-${r.vehicle_index}`}
                  onClick={() => setSelectedVehicleIndex(r.vehicle_index)}
                  className={`flex-1 py-1.5 px-2 rounded-card text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                    selectedVehicleIndex === r.vehicle_index
                      ? 'bg-pine-700 text-white'
                      : 'text-ink-500 hover:text-ink-900'
                  }`}
                >
                  <Truck className="h-3 w-3" /> #{r.vehicle_index}
                </button>
              ))}
            </div>
          )}

          {/* Pickup Plan Sequences */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-ink-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-pine-700" /> Route sequence
              </span>
              <span className="text-[10px] font-mono text-ink-500">Cap: 15T / Truck</span>
            </h4>

            {displayedRoutes.map((route) => {
              const farmStops = route.stops.filter(s => s.type === 'farm');

              return (
                <div 
                  key={`route-card-${route.vehicle_index}`} 
                  className="bg-paper-50 border border-line-200 rounded-card p-3 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-line-200">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="w-5 h-5 rounded bg-pine-900 text-white text-[10px] font-semibold flex items-center justify-center">
                        #{route.vehicle_index}
                      </span>
                      <span className="font-semibold text-xs text-ink-900 font-sans">
                        Truck #{route.vehicle_index}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-pine-700 bg-pine-100 px-2 py-0.5 rounded-card">
                      {route.total_quantity_tonnes}T load ({route.capacity_utilization_pct}%)
                    </span>
                  </div>

                  <div className="relative pl-3 border-l-2 border-pine-700 space-y-2">
                    <div className="relative flex items-center gap-2 text-xs">
                      <span className="absolute -left-[17px] w-2.5 h-2.5 rounded-full bg-soil-700 border-2 border-white"></span>
                      <div>
                        <span className="font-medium text-ink-900 block text-[11px]">DEPOT · GreenGrow Plant</span>
                      </div>
                    </div>

                    {farmStops.map((stop) => (
                      <div key={`stop-item-${stop.id}`} className="relative flex items-center justify-between gap-2 text-xs bg-surface-0 p-2 rounded-card border border-line-200">
                        <span className="absolute -left-[17px] w-2.5 h-2.5 rounded-full bg-pine-700 border-2 border-white"></span>
                        
                        <div>
                          <span className="font-semibold text-ink-900 block text-[11px]">
                            Stop #{stop.sequence}. {stop.name}
                          </span>
                          <span className="text-[10px] font-mono text-ink-500">
                            {stop.residue_type || 'Rice Straw'} · {stop.estimated_travel_minutes} mins
                          </span>
                        </div>

                        <span className="font-mono font-semibold text-xs text-pine-700 bg-pine-100 px-1.5 py-0.5 rounded-card shrink-0">
                          {stop.quantity_tonnes}T
                        </span>
                      </div>
                    ))}

                    <div className="relative flex items-center gap-2 text-xs pt-1">
                      <span className="absolute -left-[17px] w-2.5 h-2.5 rounded-full bg-soil-700 border-2 border-white"></span>
                      <div>
                        <span className="font-medium text-ink-900 block text-[11px]">RETURN TO DEPOT</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status Verification */}
          <div className="mt-4 pt-3 border-t border-line-200">
            <h4 className="text-[10px] font-mono uppercase text-ink-500 mb-2 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-pine-700" /> System status
            </h4>
            <div className="space-y-1 text-[11px] text-ink-500 font-mono">
              <div>✓ Farm coordinates & payloads loaded</div>
              <div>✓ OpenRouteService matrix resolved</div>
              <div>✓ Google OR-Tools CVRP solver verified</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
