import os
import logging
import httpx
from typing import List, Tuple, Dict, Any, Optional
try:
    from utils.geo_utils import build_haversine_matrix, haversine_distance_km
except ImportError:
    from .geo_utils import build_haversine_matrix, haversine_distance_km


logger = logging.getLogger(__name__)

# Base URL defaults to HeiGIT / OpenRouteService endpoint
ORS_BASE_URL = os.getenv("OPENROUTESERVICE_BASE_URL", "https://api.openrouteservice.org").rstrip("/")
ORS_API_KEY = os.getenv("OPENROUTESERVICE_API_KEY", "")

TIMEOUT_SECONDS = 12.0

class ORSService:
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENROUTESERVICE_API_KEY", "")
        self.base_url = (base_url or os.getenv("OPENROUTESERVICE_BASE_URL", "https://api.openrouteservice.org")).rstrip("/")

    def get_matrix(self, locations: List[Tuple[float, float]]) -> Tuple[List[List[float]], List[List[float]], str]:
        """
        Fetch distance and duration matrix between locations.
        locations: List of (lat, lng) tuples.
        Returns (distances_meters, durations_seconds, source_str).
        """
        if not self.api_key:
            logger.warning("OPENROUTESERVICE_API_KEY missing. Using Haversine matrix fallback.")
            distances, durations = build_haversine_matrix(locations)
            return distances, durations, "haversine_fallback"

        # ORS expects coordinates in [lng, lat] format
        ors_locations = [[lng, lat] for lat, lng in locations]
        
        headers = {
            "Authorization": self.api_key,
            "Content-Type": "application/json",
            "Accept": "application/json, application/geo+json"
        }
        
        body = {
            "locations": ors_locations,
            "metrics": ["distance", "duration"],
            "units": "m"
        }

        # Try endpoints in sequence if preferred endpoint transitions
        endpoints = [
            f"{self.base_url}/v2/matrix/driving-car",
            "https://api.openrouteservice.org/v2/matrix/driving-car",
            "https://api.heigit.org/v2/matrix/driving-car"
        ]

        for endpoint in endpoints:
            try:
                with httpx.Client(timeout=TIMEOUT_SECONDS) as client:
                    response = client.post(endpoint, json=body, headers=headers)
                    if response.status_code == 200:
                        data = response.json()
                        distances = data.get("distances")
                        durations = data.get("durations")
                        if distances and durations:
                            logger.info(f"Successfully retrieved ORS matrix from {endpoint}")
                            return distances, durations, "ors"
                    else:
                        logger.warning(f"ORS Matrix endpoint {endpoint} returned status {response.status_code}")
            except Exception as e:
                logger.warning(f"Failed calling ORS Matrix at {endpoint}: {str(e)}")

        logger.warning("ORS Matrix calls failed or timed out. Falling back to Haversine matrix.")
        distances, durations = build_haversine_matrix(locations)
        return distances, durations, "haversine_fallback"

    def get_directions(self, coordinates: List[Tuple[float, float]]) -> Dict[str, Any]:
        """
        Retrieve GeoJSON directions for ordered [lng, lat] coordinate list.
        coordinates: List of (lat, lng) tuples.
        """
        if len(coordinates) < 2:
            return self._build_fallback_geojson(coordinates)

        ors_coordinates = [[lng, lat] for lat, lng in coordinates]

        if not self.api_key:
            return self._build_fallback_geojson(coordinates)

        headers = {
            "Authorization": self.api_key,
            "Content-Type": "application/json",
            "Accept": "application/json, application/geo+json"
        }

        body = {
            "coordinates": ors_coordinates
        }

        endpoints = [
            f"{self.base_url}/v2/directions/driving-car/geojson",
            "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
            "https://api.heigit.org/v2/directions/driving-car/geojson"
        ]

        for endpoint in endpoints:
            try:
                with httpx.Client(timeout=TIMEOUT_SECONDS) as client:
                    response = client.post(endpoint, json=body, headers=headers)
                    if response.status_code == 200:
                        geojson_data = response.json()
                        logger.info(f"Successfully fetched directions GeoJSON from {endpoint}")
                        return geojson_data
            except Exception as e:
                logger.warning(f"ORS Directions endpoint {endpoint} error: {str(e)}")

        return self._build_fallback_geojson(coordinates)

    def _build_fallback_geojson(self, coordinates: List[Tuple[float, float]]) -> Dict[str, Any]:
        """Fallback GeoJSON LineString connecting ordered coordinates."""
        # Convert (lat, lng) to GeoJSON standard [lng, lat]
        geojson_coords = [[lng, lat] for lat, lng in coordinates]
        
        total_dist_km = 0.0
        for i in range(len(coordinates) - 1):
            total_dist_km += haversine_distance_km(
                coordinates[i][0], coordinates[i][1],
                coordinates[i+1][0], coordinates[i+1][1]
            )

        return {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "summary": {
                            "distance": round(total_dist_km * 1000.0, 1),
                            "duration": round((total_dist_km / 40.0) * 3600.0, 1)
                        },
                        "is_fallback": True
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": geojson_coords
                    }
                }
            ]
        }
