"""SENTINEL-X Attack Path Analysis Router"""
import random
from fastapi import APIRouter
from core.cyber_range_engine import state, generate_attack_path
from core.models import ATTACK_SCENARIOS, NETWORK_ASSETS

router = APIRouter()

@router.get("/")
async def get_attack_paths():
    return {"paths": state.attack_paths, "total": len(state.attack_paths)}

@router.get("/graph/{incident_id}")
async def get_attack_graph(incident_id: str):
    incident = next((i for i in state.incidents if i["id"] == incident_id), None)
    if not incident:
        return {"error": "Not found"}
    return {"incident_id": incident_id, "graph": incident.get("attack_path", {})}

@router.get("/critical-paths")
async def get_critical_paths():
    """Get highest risk attack paths"""
    paths = [p for p in state.attack_paths if p.get("risk_score", 0) >= 85]
    return {"critical_paths": paths[:5]}

@router.get("/assets")
async def get_network_assets():
    return {"assets": NETWORK_ASSETS}
