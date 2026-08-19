from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class FarmPickupInput(BaseModel):
    farmer_id: str
    farmer_name: str
    listing_id: str
    purchase_request_id: str
    latitude: float
    longitude: float
    accepted_quantity_tonnes: float
    residue_type: str = "Residue"
    price_per_tonne: Optional[float] = 1000.0

class DepotInput(BaseModel):
    buyer_id: str
    company_name: str
    latitude: float
    longitude: float

class OptimizeRouteRequest(BaseModel):
    buyer_demand_id: Optional[str] = "demo_demand_1"
    buyer_depot: Optional[DepotInput] = None
    farms: Optional[List[FarmPickupInput]] = None
    vehicle_capacity_tonnes: float = Field(default=15.0, gt=0)
    vehicle_count: int = Field(default=1, ge=1)
    cost_per_km: Optional[float] = 20.0  # ₹20 per km logistics cost estimate

class RouteStop(BaseModel):
    sequence: int
    type: str  # 'depot' or 'farm'
    id: str
    name: str
    latitude: float
    longitude: float
    quantity_tonnes: float
    residue_type: Optional[str] = None
    estimated_travel_minutes: float = 0.0

class VehicleRoute(BaseModel):
    vehicle_index: int
    stops: List[RouteStop]
    total_quantity_tonnes: float
    distance_km: float
    duration_minutes: float
    capacity_utilization_pct: float
    geometry: Dict[str, Any]

class BaselineComparison(BaseModel):
    traditional_distance_km: float
    traditional_cost_est: float
    optimized_distance_km: float
    optimized_cost_est: float
    distance_saved_km: float
    savings_pct: float
    cost_saved_est: float

class OptimizeRouteResponse(BaseModel):
    status: str = "success"
    buyer_demand_id: str
    buyer_name: str
    optimization_source: str  # 'ors' or 'haversine_fallback'
    algorithm: str  # 'ortools_cvrp' or 'nearest_neighbor_fallback'
    vehicle_count: int
    vehicle_capacity_tonnes: float
    total_distance_km: float
    total_duration_minutes: float
    total_quantity_tonnes: float
    excluded_farms_count: int = 0
    warning_message: Optional[str] = None
    routes: List[VehicleRoute]
    baseline: BaselineComparison
