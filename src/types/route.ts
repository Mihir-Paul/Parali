export interface RouteStop {
  sequence: number;
  type: 'depot' | 'farm';
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  quantity_tonnes: number;
  residue_type?: string;
  estimated_travel_minutes: number;
}

export interface GeoJSONGeometry {
  type: string;
  coordinates: number[][] | number[][][]; // [lng, lat]
}

export interface GeoJSONFeature {
  type: 'Feature';
  properties: Record<string, any>;
  geometry: GeoJSONGeometry;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface VehicleRoute {
  vehicle_index: number;
  stops: RouteStop[];
  total_quantity_tonnes: number;
  distance_km: number;
  duration_minutes: number;
  capacity_utilization_pct: number;
  geometry: GeoJSONFeatureCollection | GeoJSONFeature;
}

export interface BaselineComparison {
  traditional_distance_km: number;
  traditional_cost_est: number;
  optimized_distance_km: number;
  optimized_cost_est: number;
  distance_saved_km: number;
  savings_pct: number;
  cost_saved_est: number;
}

export interface OptimizeRouteResponse {
  status: string;
  buyer_demand_id: string;
  buyer_name: string;
  optimization_source: 'ors' | 'haversine_fallback' | string;
  algorithm: 'ortools_cvrp' | 'nearest_neighbor_fallback' | string;
  vehicle_count: number;
  vehicle_capacity_tonnes: number;
  total_distance_km: number;
  total_duration_minutes: number;
  total_quantity_tonnes: number;
  excluded_farms_count: number;
  warning_message?: string;
  routes: VehicleRoute[];
  baseline: BaselineComparison;
}

export interface FarmPickupInput {
  farmer_id: string;
  farmer_name: string;
  listing_id: string;
  purchase_request_id: string;
  latitude: number;
  longitude: number;
  accepted_quantity_tonnes: number;
  residue_type?: string;
  price_per_tonne?: number;
}

export interface DepotInput {
  buyer_id: string;
  company_name: string;
  latitude: number;
  longitude: number;
}

export interface OptimizeRouteRequest {
  buyer_demand_id?: string;
  buyer_depot?: DepotInput;
  farms?: FarmPickupInput[];
  vehicle_capacity_tonnes?: number;
  vehicle_count?: number;
  cost_per_km?: number;
}
