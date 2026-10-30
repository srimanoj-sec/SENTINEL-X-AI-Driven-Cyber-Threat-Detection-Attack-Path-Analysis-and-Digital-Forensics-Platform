"""SENTINEL-X Threats Router - Threat detection and analysis"""
import random
import uuid
from datetime import datetime
from fastapi import APIRouter
from core.detection_engine import DetectionEngine
from core.models import MITRE_TECHNIQUES, MALICIOUS_IPS, NETWORK_ASSETS
from core.cyber_range_engine import state

router = APIRouter()
detector = DetectionEngine()

@router.get("/")
async def list_threats():
    return {"threats": state.events[:50], "total": len(state.events)}

@router.get("/mitre-techniques")
async def get_mitre_techniques():
    return {"techniques": [{"id": k, **v} for k, v in MITRE_TECHNIQUES.items()]}

@router.post("/analyze-ip")
async def analyze_ip(ip: str):
    intel = detector.check_ip_reputation(ip)
    return intel

@router.post("/detect-anomaly")
async def detect_anomaly(hour: int = 12, country: str = "India", failed_logins: int = 1, bytes_mb: float = 10.0):
    result = detector.ml_detector.detect_anomaly({
        "hour": hour,
        "day_of_week": 2,
        "login_count": 5,
        "bytes_mb": bytes_mb,
        "unique_ips": 3,
        "failed_logins": failed_logins
    })
    return result

@router.get("/behavioral-analysis")
async def behavioral_analysis():
    users = ["john.smith", "jane.doe", "admin.svc", "backup.user"]
    results = []
    for user in users:
        hour = random.choice([2, 9, 14, 23])
        country = random.choice(["India", "Russia", "India", "China"])
        device = random.choice(["laptop-corp-01", "unknown-device-xyz", "workstation-2"])
        result = detector.ml_detector.check_behavioral_baseline(user, hour, country, device)
        results.append(result)
    return {"analyses": results}
