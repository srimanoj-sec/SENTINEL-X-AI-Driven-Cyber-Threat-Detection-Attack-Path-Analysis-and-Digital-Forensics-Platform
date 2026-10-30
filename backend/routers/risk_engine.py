"""SENTINEL-X Risk Engine Router"""
import random
from fastapi import APIRouter
from core.cyber_range_engine import calculate_risk_score, state
from core.models import NETWORK_ASSETS

router = APIRouter()

@router.get("/scores")
async def get_risk_scores():
    scores = []
    for incident in state.incidents[:20]:
        scores.append({
            "incident_id": incident["id"],
            "title": incident["title"],
            "risk_score": incident.get("risk_score", 0),
            "severity": incident.get("severity", "MEDIUM"),
            "breakdown": incident.get("risk_breakdown", {})
        })
    return {"scores": sorted(scores, key=lambda x: x["risk_score"], reverse=True)}

@router.post("/calculate")
async def calculate_risk(severity: str = "HIGH", asset_criticality: str = "HIGH", technique_count: int = 3):
    techniques = [f"T{random.randint(1000,1999)}" for _ in range(technique_count)]
    result = calculate_risk_score(severity, asset_criticality, techniques)
    return result

@router.get("/asset-risk")
async def asset_risk():
    assets = []
    for asset in NETWORK_ASSETS:
        incidents_count = len([i for i in state.incidents if i.get("target_asset", {}).get("id") == asset["id"]])
        risk = random.randint(30, 95) if incidents_count > 0 else random.randint(10, 40)
        assets.append({**asset, "risk_score": risk, "incidents": incidents_count})
    return {"assets": sorted(assets, key=lambda x: x["risk_score"], reverse=True)}
