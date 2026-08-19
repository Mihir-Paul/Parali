import logging
import math
from typing import List, Tuple, Dict, Any, Optional
try:
    from ortools.constraint_solver import routing_enums_pb2
    from ortools.constraint_solver import pywrapcp
    ORTOOLS_AVAILABLE = True
except ImportError:
    routing_enums_pb2 = None
    pywrapcp = None
    ORTOOLS_AVAILABLE = False

try:
    from models.route_models import (
        FarmPickupInput, DepotInput, RouteStop, VehicleRoute, BaselineComparison, OptimizeRouteResponse
    )
    from services.ors_service import ORSService
    from utils.geo_utils import validate_coordinates
except ImportError:
    from ..models.route_models import (
        FarmPickupInput, DepotInput, RouteStop, VehicleRoute, BaselineComparison, OptimizeRouteResponse
    )
    from .ors_service import ORSService
    from ..utils.geo_utils import validate_coordinates


logger = logging.getLogger(__name__)

class RoutingOptimizerService:
    def __init__(self, ors_service: Optional[ORSService] = None):
        self.ors_service = ors_service or ORSService()

    def optimize_pickup_route(
        self,
        buyer_demand_id: str,
        depot: DepotInput,
        farms: List[FarmPickupInput],
        vehicle_capacity_tonnes: float = 15.0,
        vehicle_count: int = 1,
        cost_per_km: float = 20.0
    ) -> OptimizeRouteResponse:
        """
        Main optimization pipeline:
        1. Filter & validate farm coordinates.
        2. Build ORS/Haversine distance & duration matrices.
        3. Solve Capacitated Vehicle Routing Problem (CVRP) via Google OR-Tools.
        4. Fallback to Nearest-Neighbor if OR-Tools cannot solve.
        5. Fetch route polylines via ORS Directions V2.
        6. Compute baseline metrics and distance savings.
        """
        # Step 1: Validate coordinates & filter
        valid_farms: List[FarmPickupInput] = []
        excluded_count = 0

        if not validate_coordinates(depot.latitude, depot.longitude):
            raise ValueError(f"Invalid buyer depot location coordinates: ({depot.latitude}, {depot.longitude})")

        for f in farms:
            if validate_coordinates(f.latitude, f.longitude) and f.accepted_quantity_tonnes > 0:
                valid_farms.append(f)
            else:
                excluded_count += 1

        if not valid_farms:
            raise ValueError("No accepted farms with valid coordinates available for optimization.")

        warning_message = None
        if excluded_count > 0:
            warning_message = f"{excluded_count} supplier farm(s) excluded due to missing or invalid location coordinates."

        # Locations list: Index 0 = Depot, Index 1..N = Farms
        locations = [(depot.latitude, depot.longitude)] + [(f.latitude, f.longitude) for f in valid_farms]
        
        # Step 2: Fetch Distance Matrix (meters) & Duration Matrix (seconds)
        dist_matrix_m, dur_matrix_s, source_type = self.ors_service.get_matrix(locations)

        # Step 3: Run OR-Tools CVRP Solver
        capacity_kg = int(round(vehicle_capacity_tonnes * 1000))
        demands_kg = [0] + [int(round(f.accepted_quantity_tonnes * 1000)) for f in valid_farms]

        routes_node_sequences, algorithm_used = self._solve_ortools_cvrp(
            dist_matrix_m=dist_matrix_m,
            demands_kg=demands_kg,
            vehicle_capacity_kg=capacity_kg,
            vehicle_count=vehicle_count
        )

        if not routes_node_sequences:
            # Fallback to Nearest Neighbor solver
            logger.warning("OR-Tools found no feasible solution. Using Nearest-Neighbor fallback.")
            routes_node_sequences = self._solve_nearest_neighbor_fallback(
                dist_matrix_m=dist_matrix_m,
                demands_kg=demands_kg,
                vehicle_capacity_kg=capacity_kg,
                vehicle_count=vehicle_count
            )
            algorithm_used = "nearest_neighbor_fallback"

        # Step 4: Construct Vehicle Routes, directions geometry, and stop details
        vehicle_routes: List[VehicleRoute] = []
        total_optimized_distance_m = 0.0
        total_optimized_duration_s = 0.0
        total_procured_tonnes = 0.0

        for v_idx, node_seq in enumerate(routes_node_sequences):
            if len(node_seq) <= 2:  # Only depot start and end, no farm pickups
                continue

            stops: List[RouteStop] = []
            route_dist_m = 0.0
            route_dur_s = 0.0
            route_tonnes = 0.0
            stop_coords: List[Tuple[float, float]] = []

            cumulative_travel_seconds = 0.0

            for seq_num, node_idx in enumerate(node_seq):
                if node_idx == 0:
                    # Depot
                    stops.append(RouteStop(
                        sequence=seq_num + 1,
                        type="depot",
                        id=depot.buyer_id,
                        name=depot.company_name,
                        latitude=depot.latitude,
                        longitude=depot.longitude,
                        quantity_tonnes=0.0,
                        estimated_travel_minutes=round(cumulative_travel_seconds / 60.0, 1)
                    ))
                    stop_coords.append((depot.latitude, depot.longitude))
                else:
                    # Farm pickup
                    farm = valid_farms[node_idx - 1]
                    route_tonnes += farm.accepted_quantity_tonnes
                    stops.append(RouteStop(
                        sequence=seq_num + 1,
                        type="farm",
                        id=farm.farmer_id,
                        name=farm.farmer_name,
                        latitude=farm.latitude,
                        longitude=farm.longitude,
                        quantity_tonnes=farm.accepted_quantity_tonnes,
                        residue_type=farm.residue_type,
                        estimated_travel_minutes=round(cumulative_travel_seconds / 60.0, 1)
                    ))
                    stop_coords.append((farm.latitude, farm.longitude))

                # Accumulate travel distance & time from previous node
                if seq_num > 0:
                    prev_node = node_seq[seq_num - 1]
                    step_dist = dist_matrix_m[prev_node][node_idx]
                    step_dur = dur_matrix_s[prev_node][node_idx]
                    route_dist_m += step_dist
                    route_dur_s += step_dur
                    cumulative_travel_seconds += step_dur

            # Fetch directions GeoJSON for this vehicle's stop sequence
            geometry = self.ors_service.get_directions(stop_coords)

            route_dist_km = round(route_dist_m / 1000.0, 2)
            route_dur_min = round(route_dur_s / 60.0, 1)
            utilization_pct = round((route_tonnes / vehicle_capacity_tonnes) * 100.0, 1) if vehicle_capacity_tonnes > 0 else 0.0

            total_optimized_distance_m += route_dist_m
            total_optimized_duration_s += route_dur_s
            total_procured_tonnes += route_tonnes

            vehicle_routes.append(VehicleRoute(
                vehicle_index=v_idx + 1,
                stops=stops,
                total_quantity_tonnes=round(route_tonnes, 2),
                distance_km=route_dist_km,
                duration_minutes=route_dur_min,
                capacity_utilization_pct=min(utilization_pct, 100.0),
                geometry=geometry
            ))

        # Step 5: Compute Baseline Distance Comparison (Direct round trips for each farm)
        traditional_distance_m = 0.0
        for farm_idx in range(1, len(locations)):
            # Depot -> Farm -> Depot
            traditional_distance_m += dist_matrix_m[0][farm_idx] + dist_matrix_m[farm_idx][0]

        traditional_dist_km = round(traditional_distance_m / 1000.0, 2)
        optimized_dist_km = round(total_optimized_distance_m / 1000.0, 2)
        distance_saved_km = round(max(0.0, traditional_dist_km - optimized_dist_km), 2)
        savings_pct = round((distance_saved_km / traditional_dist_km * 100.0), 1) if traditional_dist_km > 0 else 0.0

        traditional_cost = round(traditional_dist_km * cost_per_km, 2)
        optimized_cost = round(optimized_dist_km * cost_per_km, 2)
        cost_saved = round(traditional_cost - optimized_cost, 2)

        baseline = BaselineComparison(
            traditional_distance_km=traditional_dist_km,
            traditional_cost_est=traditional_cost,
            optimized_distance_km=optimized_dist_km,
            optimized_cost_est=optimized_cost,
            distance_saved_km=distance_saved_km,
            savings_pct=savings_pct,
            cost_saved_est=max(0.0, cost_saved)
        )

        return OptimizeRouteResponse(
            status="success",
            buyer_demand_id=buyer_demand_id,
            buyer_name=depot.company_name,
            optimization_source=source_type,
            algorithm=algorithm_used,
            vehicle_count=len(vehicle_routes),
            vehicle_capacity_tonnes=vehicle_capacity_tonnes,
            total_distance_km=optimized_dist_km,
            total_duration_minutes=round(total_optimized_duration_s / 60.0, 1),
            total_quantity_tonnes=round(total_procured_tonnes, 2),
            excluded_farms_count=excluded_count,
            warning_message=warning_message,
            routes=vehicle_routes,
            baseline=baseline
        )

    def _solve_ortools_cvrp(
        self,
        dist_matrix_m: List[List[float]],
        demands_kg: List[int],
        vehicle_capacity_kg: int,
        vehicle_count: int
    ) -> Tuple[List[List[int]], str]:
        """Solve CVRP using Google OR-Tools."""
        num_locations = len(dist_matrix_m)
        if num_locations <= 1:
            return [], "ortools_cvrp"

        # Create Routing Index Manager (depot = 0)
        manager = pywrapcp.RoutingIndexManager(num_locations, vehicle_count, 0)
        routing = pywrapcp.RoutingModel(manager)

        # Distance callback
        def distance_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return int(round(dist_matrix_m[from_node][to_node]))

        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        # Demand / Capacity Callback
        def demand_callback(from_index):
            from_node = manager.IndexToNode(from_index)
            return demands_kg[from_node]

        demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
        routing.AddDimensionWithVehicleCapacity(
            demand_callback_index,
            0,  # null capacity slack
            [vehicle_capacity_kg] * vehicle_count,  # capacity for each vehicle
            True,  # start capacity at zero
            "Capacity"
        )

        # Search Parameters
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_parameters.time_limit.seconds = 3

        # Solve
        solution = routing.SolveWithParameters(search_parameters)

        if not solution:
            return [], "ortools_cvrp_failed"

        routes: List[List[int]] = []
        for vehicle_id in range(vehicle_count):
            index = routing.Start(vehicle_id)
            route: List[int] = []
            while not routing.IsEnd(index):
                node = manager.IndexToNode(index)
                route.append(node)
                index = solution.Value(routing.NextVar(index))
            # Append depot end node
            route.append(manager.IndexToNode(index))
            routes.append(route)

        return routes, "ortools_cvrp"

    def _solve_nearest_neighbor_fallback(
        self,
        dist_matrix_m: List[List[float]],
        demands_kg: List[int],
        vehicle_capacity_kg: int,
        vehicle_count: int
    ) -> List[List[int]]:
        """Greedy Capacity-Constrained Nearest-Neighbor Fallback Solver."""
        num_locations = len(dist_matrix_m)
        unvisited = set(range(1, num_locations))
        routes: List[List[int]] = []

        for v in range(vehicle_count):
            if not unvisited:
                break

            current_node = 0
            current_load = 0
            route = [0]

            while unvisited:
                # Find nearest unvisited farm that fits in current truck capacity
                candidates = [
                    node for node in unvisited 
                    if current_load + demands_kg[node] <= vehicle_capacity_kg
                ]

                if not candidates:
                    # Vehicle full or remaining farms exceed capacity
                    break

                # Choose closest candidate from current_node
                next_node = min(candidates, key=lambda n: dist_matrix_m[current_node][n])
                route.append(next_node)
                current_load += demands_kg[next_node]
                current_node = next_node
                unvisited.remove(next_node)

            # Return to depot
            route.append(0)
            routes.append(route)

        # If farms still remain unassigned due to insufficient vehicles/capacity, force distribute to last vehicle
        if unvisited and routes:
            last_route = routes[-1]
            last_route.pop()  # remove depot end
            for node in list(unvisited):
                last_route.append(node)
            last_route.append(0)

        return routes
