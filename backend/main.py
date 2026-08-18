from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(
    title="Parali API",
    description="Backend routing and matching intelligence engine for Parali platform",
    version="1.0.0"
)

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

@app.post("/api/optimize-route")
def optimize_route(farm_ids: List[str]):
    # Simulated sweep routing heuristics response
    return {
        "status": "success",
        "farms_optimized": len(farm_ids) or 14,
        "total_tonnage": 47.8,
        "distance_km": 82,
        "standard_cost": 4850,
        "optimized_cost": 3240,
        "savings": 1610,
        "sequence": ["start_depot"] + farm_ids + ["end_buyer"]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
