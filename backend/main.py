import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

from models.route_models import (
    OptimizeRouteRequest, OptimizeRouteResponse, DepotInput, FarmPickupInput
)
from services.routing_service import RoutingOptimizerService
from services.firms_service import FirmsService, FirmsRateLimitError

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Parali API",
    description="Backend routing and matching intelligence engine for Parali platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

optimizer_service = RoutingOptimizerService()
firms_service = FirmsService()


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
    if not request or (not request.farms and not request.buyer_depot):
        # Default sample data for demo/testing
        depot = DepotInput(
            buyer_id="b_demo",
            company_name="GreenGrow Bio-Energy Plant",
            latitude=30.3400,
            longitude=76.3800
        )
        farms = [
            FarmPickupInput(
                farmer_id="f1", farmer_name="Gurpreet Singh", listing_id="l1", purchase_request_id="pr1",
                latitude=30.3550, longitude=76.4120, accepted_quantity_tonnes=8.5, residue_type="Rice Straw"
            ),
            FarmPickupInput(
                farmer_id="f2", farmer_name="Harmanpreet Kaur", listing_id="l2", purchase_request_id="pr2",
                latitude=30.3120, longitude=76.4500, accepted_quantity_tonnes=12.0, residue_type="Paddy Straw"
            ),
            FarmPickupInput(
                farmer_id="f3", farmer_name="Jagjit Singh", listing_id="l3", purchase_request_id="pr3",
                latitude=30.2900, longitude=76.3500, accepted_quantity_tonnes=6.0, residue_type="Wheat Straw"
            ),
            FarmPickupInput(
                farmer_id="f4", farmer_name="Sukhwinder Sharma", listing_id="l4", purchase_request_id="pr4",
                latitude=30.3800, longitude=76.3200, accepted_quantity_tonnes=10.0, residue_type="Rice Straw"
            )
        ]
        vehicle_capacity = 15.0
        vehicle_count = 2
        buyer_demand_id = "demo_demand_1"
        cost_per_km = 20.0
    else:
        depot = request.buyer_depot or DepotInput(
            buyer_id="b_demo",
            company_name="Buyer Depot",
            latitude=30.3400,
            longitude=76.3800
        )
        farms = request.farms or []
        vehicle_capacity = request.vehicle_capacity_tonnes
        vehicle_count = request.vehicle_count
        buyer_demand_id = request.buyer_demand_id or "demo_demand_1"
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


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
