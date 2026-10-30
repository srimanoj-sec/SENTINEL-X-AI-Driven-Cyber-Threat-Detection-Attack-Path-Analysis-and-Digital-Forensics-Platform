"""SENTINEL-X Forensics Router - Digital forensics and evidence management"""
import uuid
import hashlib
import random
from datetime import datetime
from fastapi import APIRouter
from core.cyber_range_engine import state, generate_forensic_evidence
from core.models import generate_evidence_id, generate_sha256

router = APIRouter()

@router.get("/evidence")
async def list_evidence(limit: int = 50):
    return {"evidence": state.evidence[:limit], "total": len(state.evidence)}

@router.get("/evidence/{evidence_id}")
async def get_evidence(evidence_id: str):
    ev = next((e for e in state.evidence if e["id"] == evidence_id), None)
    if not ev:
        return {"error": "Evidence not found"}
    return ev

@router.get("/timeline/{incident_id}")
async def get_incident_timeline(incident_id: str):
    incident = next((i for i in state.incidents if i["id"] == incident_id), None)
    if not incident:
        return {"error": "Incident not found"}
    return {"incident_id": incident_id, "timeline": incident.get("timeline", [])}

@router.post("/hash-file")
async def hash_file(filename: str, content: str = "sample"):
    sha256 = hashlib.sha256(content.encode()).hexdigest()
    md5 = hashlib.md5(content.encode()).hexdigest()
    return {
        "filename": filename,
        "sha256": sha256,
        "md5": md5,
        "integrity": "VALID",
        "computed_at": datetime.utcnow().isoformat()
    }

@router.get("/chain-of-custody/{evidence_id}")
async def chain_of_custody(evidence_id: str):
    ev = next((e for e in state.evidence if e["id"] == evidence_id), None)
    if not ev:
        return {"error": "Not found"}
    return {
        "evidence_id": evidence_id,
        "filename": ev.get("filename"),
        "sha256": ev.get("sha256"),
        "chain": ev.get("chain_of_custody", []),
        "integrity": ev.get("integrity", "VALID")
    }
