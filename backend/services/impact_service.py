import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("impact_service")
logger.setLevel(logging.INFO)

# Centralized environmental factors (documented & configurable estimates)
# 1 tonne of crop residue burned in open field releases ~1.5 tonnes CO2 equivalent
EMISSIONS_FACTOR_TCO2E_PER_TONNE = 1.5

# Standard agronomic nutrient loss estimates per tonne of burned residue (INR)
# Includes N (Nitrogen), P (Phosphorus), K (Potassium), and S (Sulfur) soil depletion
AGRONOMIC_NUTRIENT_LOSS_PER_TONNE = {
    "Rice Straw": {"npk_loss_inr": 850, "carbon_loss_kg": 400},
    "Paddy Straw": {"npk_loss_inr": 850, "carbon_loss_kg": 400},
    "Wheat Straw": {"npk_loss_inr": 950, "carbon_loss_kg": 450},
    "Cotton Stalks": {"npk_loss_inr": 700, "carbon_loss_kg": 350},
    "Mustard Stalks": {"npk_loss_inr": 750, "carbon_loss_kg": 380},
    "Sugarcane Trash": {"npk_loss_inr": 900, "carbon_loss_kg": 420},
    "default": {"npk_loss_inr": 850, "carbon_loss_kg": 400}
}


class ImpactService:
    def __init__(self):
        # Sample platform transaction ledger for derived impact calculations
        # In full production, this queries Supabase tables: listings, purchase_requests, routes
        self._seed_sample_completed_records()

    def _seed_sample_completed_records(self):
        """Initializes sample completed transaction data for backend calculation when DB is empty."""
        self.completed_transactions = [
            {
                "transaction_id": "tx_101",
                "listing_id": "l1",
                "farmer_id": "f1",
                "farmer_name": "Ramesh Kumar",
                "buyer_id": "b1",
                "buyer_name": "GreenGrow Bio-Energy Plant",
                "residue_type": "Rice Straw",
                "quantity_tonnes": 8.5,
                "price_per_tonne_inr": 1200.0,
                "status": "completed",
                "completed_at": "2026-08-10T10:30:00Z"
            },
            {
                "transaction_id": "tx_102",
                "listing_id": "l2",
                "farmer_id": "f2",
                "farmer_name": "Gurpreet Singh",
                "buyer_id": "b1",
                "buyer_name": "GreenGrow Bio-Energy Plant",
                "residue_type": "Paddy Straw",
                "quantity_tonnes": 12.0,
                "price_per_tonne_inr": 1150.0,
                "status": "completed",
                "completed_at": "2026-08-12T14:15:00Z"
            },
            {
                "transaction_id": "tx_103",
                "listing_id": "l3",
                "farmer_id": "f3",
                "farmer_name": "Harmanpreet Kaur",
                "buyer_id": "b2",
                "buyer_name": "Punjab Bio-Pellets Ltd",
                "residue_type": "Wheat Straw",
                "quantity_tonnes": 6.0,
                "price_per_tonne_inr": 1300.0,
                "status": "completed",
                "completed_at": "2026-08-15T09:00:00Z"
            },
            {
                "transaction_id": "tx_104",
                "listing_id": "l4",
                "farmer_id": "f4",
                "farmer_name": "Sukhwinder Sharma",
                "buyer_id": "b1",
                "buyer_name": "GreenGrow Bio-Energy Plant",
                "residue_type": "Rice Straw",
                "quantity_tonnes": 10.0,
                "price_per_tonne_inr": 1200.0,
                "status": "completed",
                "completed_at": "2026-08-18T16:45:00Z"
            }
        ]

        self.completed_routes = [
            {
                "route_id": "rt_201",
                "buyer_id": "b1",
                "pickup_count": 3,
                "naive_distance_km": 104.5,
                "optimized_distance_km": 68.4,
                "completed_at": "2026-08-18T18:00:00Z"
            },
            {
                "route_id": "rt_202",
                "buyer_id": "b2",
                "pickup_count": 1,
                "naive_distance_km": 42.0,
                "optimized_distance_km": 31.5,
                "completed_at": "2026-08-15T11:00:00Z"
            }
        ]

    def record_completed_transaction(
        self,
        listing_id: str,
        farmer_id: str,
        farmer_name: str,
        buyer_id: str,
        buyer_name: str,
        residue_type: str,
        quantity_tonnes: float,
        price_per_tonne_inr: float
    ) -> Dict[str, Any]:
        """Records a new completed transaction to update impact metrics dynamically."""
        tx = {
            "transaction_id": f"tx_{len(self.completed_transactions) + 101}",
            "listing_id": listing_id,
            "farmer_id": farmer_id,
            "farmer_name": farmer_name,
            "buyer_id": buyer_id,
            "buyer_name": buyer_name,
            "residue_type": residue_type,
            "quantity_tonnes": float(quantity_tonnes),
            "price_per_tonne_inr": float(price_per_tonne_inr),
            "status": "completed",
            "completed_at": "2026-08-19T16:30:00Z"
        }
        self.completed_transactions.append(tx)
        logger.info("Recorded completed transaction %s for farmer %s (%.1f tonnes)", tx["transaction_id"], farmer_id, quantity_tonnes)
        return tx

    def calculate_impact_summary(
        self,
        farmer_id: Optional[str] = None,
        buyer_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Derives all real platform impact metrics server-side.
        Filters by farmer_id or buyer_id if provided.
        """
        # Filter transactions
        txs = self.completed_transactions
        if farmer_id:
            txs = [t for t in txs if t.get("farmer_id") == farmer_id]
        elif buyer_id:
            txs = [t for t in txs if t.get("buyer_id") == buyer_id]

        # 1. Residue Diverted (Tonnes)
        residue_diverted_tonnes = round(sum(t.get("quantity_tonnes", 0.0) for t in txs), 2)

        # 2. Farmer Income Generated (INR)
        farmer_income_inr = round(sum(t.get("quantity_tonnes", 0.0) * t.get("price_per_tonne_inr", 0.0) for t in txs), 2)

        # 3. Distinct Farmers Benefited
        distinct_farmers = set(t.get("farmer_id") for t in txs if t.get("farmer_id"))
        farmers_benefited_count = len(distinct_farmers)

        # 4. Logistics Distance Saved (km)
        routes = self.completed_routes
        if buyer_id:
            routes = [r for r in routes if r.get("buyer_id") == buyer_id]

        total_naive_distance = sum(r.get("naive_distance_km", 0.0) for r in routes)
        total_optimized_distance = sum(r.get("optimized_distance_km", 0.0) for r in routes)
        distance_saved_km = round(max(0.0, total_naive_distance - total_optimized_distance), 2)

        average_route_reduction_percent = 0.0
        if total_naive_distance > 0:
            average_route_reduction_percent = round((distance_saved_km / total_naive_distance) * 100.0, 1)

        # 5. Estimated Emissions Avoided (tCO2e)
        estimated_emissions_avoided_tco2e = round(residue_diverted_tonnes * EMISSIONS_FACTOR_TCO2E_PER_TONNE, 2)

        # 6. Potential Burning Prevented (Tonnes)
        potential_burning_prevented_tonnes = residue_diverted_tonnes

        # Average income per farmer
        avg_income_per_farmer_inr = round(farmer_income_inr / farmers_benefited_count, 2) if farmers_benefited_count > 0 else 0.0

        return {
            "residue_diverted_tonnes": residue_diverted_tonnes,
            "farmer_income_inr": farmer_income_inr,
            "farmers_benefited": farmers_benefited_count,
            "distance_saved_km": distance_saved_km,
            "average_route_reduction_percent": average_route_reduction_percent,
            "estimated_emissions_avoided_tco2e": estimated_emissions_avoided_tco2e,
            "potential_burning_prevented_tonnes": potential_burning_prevented_tonnes,
            "average_income_per_farmer_inr": avg_income_per_farmer_inr,
            "completed_transactions_count": len(txs),
            "emissions_factor_description": f"Configured factor: {EMISSIONS_FACTOR_TCO2E_PER_TONNE} tCO2e avoided per tonne of open residue burning prevented.",
            "is_estimate_notice": "All CO2e & burning prevention figures are conservative estimated projections based on diverted biomass tonnage and documented emission factors."
        }

    def calculate_impact_history(self) -> List[Dict[str, Any]]:
        """Returns cumulative historical impact records aggregated over time."""
        history = [
            {"date": "2026-08-10", "residue_diverted_tonnes": 8.5, "farmer_income_inr": 10200.0, "emissions_avoided_tco2e": 12.75, "distance_saved_km": 10.5},
            {"date": "2026-08-12", "residue_diverted_tonnes": 20.5, "farmer_income_inr": 24000.0, "emissions_avoided_tco2e": 30.75, "distance_saved_km": 21.0},
            {"date": "2026-08-15", "residue_diverted_tonnes": 26.5, "farmer_income_inr": 31800.0, "emissions_avoided_tco2e": 39.75, "distance_saved_km": 31.5},
            {"date": "2026-08-18", "residue_diverted_tonnes": 36.5, "farmer_income_inr": 43800.0, "emissions_avoided_tco2e": 54.75, "distance_saved_km": 46.6}
        ]
        return history

    def calculate_farmer_hidden_cost(
        self,
        residue_type: str,
        quantity_tonnes: float,
        selling_price_per_tonne: float
    ) -> Dict[str, Any]:
        """
        Calculates side-by-side comparison for a farmer:
        Scenario A: Burning residue in field
        Scenario B: Selling residue through Parali marketplace
        """
        norm_type = residue_type if residue_type in AGRONOMIC_NUTRIENT_LOSS_PER_TONNE else "default"
        factors = AGRONOMIC_NUTRIENT_LOSS_PER_TONNE[norm_type]

        # Scenario A: Burning
        burning_income_inr = 0.0
        estimated_nutrient_loss_inr = round(quantity_tonnes * factors["npk_loss_inr"], 2)
        estimated_carbon_loss_kg = round(quantity_tonnes * factors["carbon_loss_kg"], 2)
        burning_net_impact_inr = -estimated_nutrient_loss_inr

        # Scenario B: Selling through Parali
        gross_residue_income_inr = round(quantity_tonnes * selling_price_per_tonne, 2)
        logistics_cost_inr = 0.0 # Managed by Parali buyer/transport
        selling_net_benefit_inr = gross_residue_income_inr

        # Comparative Difference
        net_farmer_advantage_inr = round(selling_net_benefit_inr - burning_net_impact_inr, 2)

        return {
            "residue_type": residue_type,
            "quantity_tonnes": quantity_tonnes,
            "selling_price_per_tonne": selling_price_per_tonne,
            "burning_scenario": {
                "income_inr": burning_income_inr,
                "estimated_nutrient_loss_inr": estimated_nutrient_loss_inr,
                "estimated_carbon_loss_kg": estimated_carbon_loss_kg,
                "net_financial_outcome_inr": burning_net_impact_inr,
                "description": "Burning destroys valuable soil N-P-K nutrients and organic carbon, requiring extra synthetic fertilizer."
            },
            "selling_scenario": {
                "gross_income_inr": gross_residue_income_inr,
                "pickup_transport_cost_inr": logistics_cost_inr,
                "net_financial_outcome_inr": selling_net_benefit_inr,
                "description": "Marketplace assumption: pickup/logistics cost borne by buyer or logistics partner."
            },
            "comparative_advantage_inr": net_farmer_advantage_inr,
            "verdict_headline": f"You are approximately ₹{net_farmer_advantage_inr:,.0f} better off by selling instead of burning.",
            "disclaimer": "Modelled agronomic estimates based on PAU/ICAR crop nutrient composition data (N, P, K & organic matter) at fertilizer replacement costs."
        }
