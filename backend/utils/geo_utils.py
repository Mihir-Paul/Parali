import math
from typing import List, Tuple, Dict, Any

EARTH_RADIUS_KM = 6371.0
AVERAGE_TRUCK_SPEED_KMH = 40.0  # Estimated average rural road speed for biomass trucks

def validate_coordinates(lat: float, lng: float) -> bool:
    """Validate latitude and longitude ranges."""
    if lat is None or lng is None:
        return False
    try:
        lat = float(lat)
        lng = float(lng)
        return -90.0 <= lat <= 90.0 and -180.0 <= lng <= 180.0
    except (ValueError, TypeError):
        return False

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points in kilometers."""
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(d_lat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2.0) ** 2)
    
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return EARTH_RADIUS_KM * c

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate Haversine distance in meters."""
    return haversine_distance_km(lat1, lon1, lat2, lon2) * 1000.0

def build_haversine_matrix(locations: List[Tuple[float, float]]) -> Tuple[List[List[float]], List[List[float]]]:
    """
    Build distance matrix (meters) and duration matrix (seconds) using Haversine formula.
    Used as fallback when OpenRouteService API is unreachable.
    locations: List of (lat, lng) tuples
    """
    n = len(locations)
    distances = [[0.0] * n for _ in range(n)]
    durations = [[0.0] * n for _ in range(n)]
    
    for i in range(n):
        for j in range(n):
            if i == j:
                distances[i][j] = 0.0
                durations[i][j] = 0.0
            else:
                dist_km = haversine_distance_km(
                    locations[i][0], locations[i][1],
                    locations[j][0], locations[j][1]
                )
                # Apply a 1.25 road circuity factor to convert straight-line to estimated road distance
                road_dist_km = dist_km * 1.25
                dist_meters = road_dist_km * 1000.0
                duration_seconds = (road_dist_km / AVERAGE_TRUCK_SPEED_KMH) * 3600.0
                
                distances[i][j] = round(dist_meters, 1)
                durations[i][j] = round(duration_seconds, 1)
                
    return distances, durations
