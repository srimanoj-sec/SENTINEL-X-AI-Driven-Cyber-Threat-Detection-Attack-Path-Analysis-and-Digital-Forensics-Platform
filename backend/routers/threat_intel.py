"""SENTINEL-X Threat Intelligence Router"""
import random
from datetime import datetime
from fastapi import APIRouter
from core.models import MALICIOUS_IPS, generate_sha256
from core.cyber_range_engine import state

router = APIRouter()

@router.get("/iocs")
async def list_iocs(limit: int = 100):
    return {"iocs": state.ioc_store[:limit], "total": len(state.ioc_store)}

@router.post("/enrich-ip")
async def enrich_ip(ip: str):
    intel = MALICIOUS_IPS.get(ip, {})
    if intel:
        return {
            "ip": ip, "reputation": intel.get("reputation"), "country": intel.get("country"),
            "asn": intel.get("asn"), "threats": intel.get("threats"),
            "threat_score": random.randint(80, 99), "enriched_at": datetime.utcnow().isoformat()
        }
    return {
        "ip": ip, "reputation": "UNKNOWN", "country": "Unknown",
        "threat_score": random.randint(0, 30), "enriched_at": datetime.utcnow().isoformat()
    }

@router.get("/feeds")
async def get_threat_feeds():
    return {
        "feeds": [
            {"name": "AlienVault OTX", "status": "active", "iocs": 1247, "last_updated": datetime.utcnow().isoformat()},
            {"name": "VirusTotal", "status": "active", "iocs": 892, "last_updated": datetime.utcnow().isoformat()},
            {"name": "Shodan", "status": "active", "iocs": 445, "last_updated": datetime.utcnow().isoformat()},
            {"name": "MISP", "status": "active", "iocs": 3211, "last_updated": datetime.utcnow().isoformat()},
        ]
    }
