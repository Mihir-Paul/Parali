import sys
import os
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

from models.route_models import (
    OptimizeRouteRequest, OptimizeRouteResponse, DepotInput, FarmPickupInput
)
from services.routing_service import RoutingOptimizerService
from services.firms_service import FirmsService, FirmsRateLimitError
from services.impact_service import ImpactService

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Parali API",
    description="Backend routing and matching intelligence engine for Parali platform",
    version="1.0.0"
)

frontend_origin = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")
origins = [origin.strip() for origin in frontend_origin.split(",")] if frontend_origin else ["http://localhost:5173"]

# Always allow standard development localhost ports for testing
if "http://localhost:5173" not in origins:
    origins.append("http://localhost:5173")
if "http://127.0.0.1:5173" not in origins:
    origins.append("http://127.0.0.1:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

optimizer_service = RoutingOptimizerService()
firms_service = FirmsService()
impact_service = ImpactService()


# Authentication dependency to verify Supabase Bearer JWT tokens
def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        # For public demo endpoints, return anonymous session ID fallback if unauthenticated
        return "anon_user"
    token = authorization.split(" ")[1]
    # In production, verify JWT using Supabase JWT secret
    return "authenticated_user_id"

class ListingCreate(BaseModel):
    crop_type: str
    quantity: float
    location: str
    pickup_date: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the Parali AI Valorization Engine API"}

@app.get("/api/farmers")
def get_farmers():
    return [
        {"id": "f1", "name": "Ramesh Kumar", "phone": "9999999999", "location": "Sangrur, Punjab", "earnings": 7450},
        {"id": "f2", "name": "Gurpreet Singh", "phone": "9876543210", "location": "Barnala, Punjab", "earnings": 12400}
    ]

@app.get("/api/hotspots")
def get_hotspots():
    return [
        {"id": "h1", "location": "Tarn Taran Region, Punjab", "confidence": 96, "potential_residue": 28},
        {"id": "h2", "location": "Firozpur Border Zone, Punjab", "confidence": 91, "potential_residue": 14}
    ]

@app.get("/api/firms/test")
def test_firms_integration(
    days: int = 1,
    source: str = "VIIRS_SNPP_NRT",
    area: str = "73.8,27.6,77.6,32.5"
):
    """
    Test endpoint for NASA FIRMS real thermal anomaly / fire detection API integration.
    Reads NASA_FIRMS_MAP_KEY securely from server-side environment.
    """
    try:
        data = firms_service.fetch_fire_data(area_bbox=area, source=source, day_range=days)
        return data
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except PermissionError as pe:
        raise HTTPException(status_code=401, detail=str(pe))
    except FirmsRateLimitError as rle:
        raise HTTPException(status_code=429, detail=str(rle))
    except TimeoutError as te:
        raise HTTPException(status_code=504, detail=str(te))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NASA FIRMS service error: {str(e)}")

@app.post("/api/optimize-route", response_model=OptimizeRouteResponse)
def optimize_route(request: Optional[OptimizeRouteRequest] = None):
    if not request or not request.buyer_depot:
        raise HTTPException(
            status_code=400,
            detail="Set buyer facility location before optimizing pickups. Buyer depot coordinates are required."
        )

    depot = request.buyer_depot
    farms = request.farms or []
    vehicle_capacity = request.vehicle_capacity_tonnes
    vehicle_count = request.vehicle_count
    buyer_demand_id = request.buyer_demand_id or "demand_active"
    cost_per_km = request.cost_per_km or 20.0

    try:
        response = optimizer_service.optimize_pickup_route(
            buyer_demand_id=buyer_demand_id,
            depot=depot,
            farms=farms,
            vehicle_capacity_tonnes=vehicle_capacity,
            vehicle_count=vehicle_count,
            cost_per_km=cost_per_km
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/impact/summary")
def get_impact_summary(
    farmer_id: Optional[str] = None,
    buyer_id: Optional[str] = None
):
    """
    Returns platform-wide or role-specific derived impact metrics from backend.
    """
    try:
        return impact_service.calculate_impact_summary(farmer_id=farmer_id, buyer_id=buyer_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate impact summary: {str(e)}")

@app.get("/api/impact/history")
def get_impact_history():
    """
    Returns historical cumulative impact data series.
    """
    try:
        return impact_service.calculate_impact_history()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch impact history: {str(e)}")

@app.get("/api/impact/farmer/{farmer_id}")
def get_farmer_impact(farmer_id: str):
    """
    Returns personalized impact metrics for a specific farmer.
    """
    try:
        return impact_service.calculate_impact_summary(farmer_id=farmer_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch farmer impact: {str(e)}")

@app.get("/api/impact/calculator")
def calculate_hidden_cost(
    residue_type: str = "Rice Straw",
    quantity_tonnes: float = 5.0,
    price_per_tonne: float = 1200.0
):
    """
    Returns side-by-side financial and soil nutrient breakdown (Burn vs Sell).
    """
    try:
        return impact_service.calculate_farmer_hidden_cost(
            residue_type=residue_type,
            quantity_tonnes=quantity_tonnes,
            selling_price_per_tonne=price_per_tonne
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute hidden cost: {str(e)}")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
