"""SENTINEL-X Incidents Router"""
from fastapi import APIRouter
from core.cyber_range_engine import state, simulate_attack
from core.models import ATTACK_SCENARIOS
import random

router = APIRouter()

@router.get("/")
async def list_incidents(limit: int = 50):
    incidents = sorted(state.incidents, key=lambda x: x.get("risk_score", 0), reverse=True)
    return {"incidents": incidents[:limit], "total": len(state.incidents)}

@router.get("/{incident_id}")
async def get_incident(incident_id: str):
    incident = next((i for i in state.incidents if i["id"] == incident_id), None)
    if not incident:
        return {"error": "Not found"}
    return incident

@router.post("/generate")
async def generate_incident():
    scenario = random.choice(ATTACK_SCENARIOS)
    incident = await simulate_attack(scenario, None)
    return incident
