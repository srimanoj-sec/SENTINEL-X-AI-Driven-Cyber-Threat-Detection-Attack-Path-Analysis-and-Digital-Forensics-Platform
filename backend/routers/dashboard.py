"""
SENTINEL-X Dashboard Router
Provides aggregated statistics for the SOC Dashboard
"""

import random
from datetime import datetime, timedelta
from fastapi import APIRouter
from core.cyber_range_engine import state
from core.models import NETWORK_ASSETS, MALICIOUS_IPS, MITRE_TECHNIQUES

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats():
    """Get comprehensive dashboard statistics"""
    incidents = state.incidents
    
    critical = len([i for i in incidents if i.get("severity") == "CRITICAL"])
    high = len([i for i in incidents if i.get("severity") == "HIGH"])
    medium = len([i for i in incidents if i.get("severity") == "MEDIUM"])
    low = len([i for i in incidents if i.get("severity") == "LOW"])
    
    return {
        "summary": {
            "total_incidents": len(incidents),
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low,
            "open": len([i for i in incidents if i.get("status") == "OPEN"]),
            "resolved": len([i for i in incidents if i.get("status") in ["RESOLVED", "CLOSED"]]),
        },
        "threat_trend": generate_threat_trend(),
        "attack_distribution": generate_attack_distribution(incidents),
        "top_attacking_ips": get_top_attacking_ips(incidents),
        "affected_assets": get_affected_assets(incidents),
        "mitre_heatmap": generate_mitre_heatmap(incidents),
        "risk_distribution": generate_risk_distribution(incidents),
        "ioc_stats": {
            "total": len(state.ioc_store),
            "malicious_ips": len([i for i in state.ioc_store if i.get("type") == "IP"]),
            "malicious_domains": len([i for i in state.ioc_store if i.get("type") == "domain"]),
            "malware_hashes": len([i for i in state.ioc_store if i.get("type") == "hash"]),
        },
        "forensics_stats": {
            "total_evidence": len(state.evidence),
            "verified": len([e for e in state.evidence if e.get("integrity") == "VALID"]),
        },
        "events_per_hour": generate_events_per_hour(),
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/incidents")
async def get_incidents(limit: int = 20, severity: str = None, status: str = None):
    """Get incidents list with filters"""
    incidents = state.incidents.copy()
    
    if severity:
        incidents = [i for i in incidents if i.get("severity") == severity.upper()]
    if status:
        incidents = [i for i in incidents if i.get("status") == status.upper()]
    
    # Sort by risk score descending
    incidents.sort(key=lambda x: x.get("risk_score", 0), reverse=True)
    
    return {"incidents": incidents[:limit], "total": len(state.incidents)}


@router.get("/incidents/{incident_id}")
async def get_incident(incident_id: str):
    """Get full incident details"""
    incident = next((i for i in state.incidents if i["id"] == incident_id), None)
    if not incident:
        return {"error": "Incident not found"}
    return incident


@router.patch("/incidents/{incident_id}/status")
async def update_incident_status(incident_id: str, status: str):
    """Update incident status"""
    for incident in state.incidents:
        if incident["id"] == incident_id:
            incident["status"] = status.upper()
            incident["updated_at"] = datetime.utcnow().isoformat()
            return {"success": True, "incident_id": incident_id, "status": status}
    return {"error": "Incident not found"}


@router.get("/timeline")
async def get_global_timeline(limit: int = 50):
    """Get global event timeline"""
    events = sorted(state.timeline_events, key=lambda x: x.get("timestamp", ""), reverse=True)
    return {"events": events[:limit]}


@router.get("/evidence")
async def get_forensic_evidence(limit: int = 20):
    """Get all forensic evidence"""
    return {"evidence": state.evidence[:limit], "total": len(state.evidence)}


@router.get("/iocs")
async def get_iocs(limit: int = 50):
    """Get all IOCs"""
    return {"iocs": state.ioc_store[:limit], "total": len(state.ioc_store)}


@router.get("/attack-paths")
async def get_attack_paths():
    """Get all attack paths"""
    return {"paths": state.attack_paths}


def generate_threat_trend():
    """Generate 24h threat trend data"""
    now = datetime.utcnow()
    trend = []
    for i in range(24):
        hour = now - timedelta(hours=23-i)
        trend.append({
            "hour": hour.strftime("%H:00"),
            "critical": random.randint(0, 3),
            "high": random.randint(0, 5),
            "medium": random.randint(1, 8),
            "low": random.randint(2, 10),
        })
    return trend


def generate_attack_distribution(incidents):
    """Generate attack type distribution"""
    distribution = {}
    for incident in incidents:
        name = incident.get("title", "Unknown")
        distribution[name] = distribution.get(name, 0) + 1
    
    result = [{"name": k, "value": v} for k, v in distribution.items()]
    
    if not result:
        result = [
            {"name": "SQL Injection → DB Dump", "value": 3},
            {"name": "Phishing → Ransomware", "value": 2},
            {"name": "Brute Force → Lateral Movement", "value": 4},
            {"name": "Web Shell → Privilege Escalation", "value": 2},
            {"name": "APT Data Exfiltration", "value": 1},
        ]
    return result


def get_top_attacking_ips(incidents):
    """Get top attacking IPs"""
    ip_counts = {}
    for incident in incidents:
        ip = incident.get("attacker_ip", "")
        if ip:
            ip_counts[ip] = ip_counts.get(ip, 0) + 1
    
    result = []
    for ip, count in sorted(ip_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
        intel = MALICIOUS_IPS.get(ip, {})
        result.append({
            "ip": ip,
            "count": count,
            "country": intel.get("country", "Unknown"),
            "reputation": intel.get("reputation", "UNKNOWN"),
            "threats": intel.get("threats", [])
        })
    return result


def get_affected_assets(incidents):
    """Get affected assets count"""
    asset_counts = {}
    for incident in incidents:
        asset = incident.get("target_asset", {})
        if asset:
            name = asset.get("name", "Unknown")
            asset_counts[name] = asset_counts.get(name, 0) + 1
    
    return [{"asset": k, "incidents": v} for k, v in sorted(asset_counts.items(), key=lambda x: x[1], reverse=True)]


def generate_mitre_heatmap(incidents):
    """Generate MITRE ATT&CK heatmap data"""
    technique_counts = {}
    for incident in incidents:
        for technique in incident.get("techniques", []):
            tid = technique.get("id", "")
            if tid:
                technique_counts[tid] = technique_counts.get(tid, 0) + 1
    
    heatmap = []
    for tid, tech in MITRE_TECHNIQUES.items():
        count = technique_counts.get(tid, 0)
        heatmap.append({
            "id": tid,
            "name": tech["name"],
            "tactic": tech["tactic"],
            "count": count,
            "severity": tech["severity"]
        })
    
    return sorted(heatmap, key=lambda x: x["count"], reverse=True)


def generate_risk_distribution(incidents):
    """Generate risk score distribution"""
    buckets = {"90-100": 0, "70-89": 0, "50-69": 0, "30-49": 0, "0-29": 0}
    for incident in incidents:
        score = incident.get("risk_score", 0)
        if score >= 90:
            buckets["90-100"] += 1
        elif score >= 70:
            buckets["70-89"] += 1
        elif score >= 50:
            buckets["50-69"] += 1
        elif score >= 30:
            buckets["30-49"] += 1
        else:
            buckets["0-29"] += 1
    return [{"range": k, "count": v} for k, v in buckets.items()]


def generate_events_per_hour():
    """Generate events per hour for last 24h"""
    now = datetime.utcnow()
    return [
        {
            "time": (now - timedelta(hours=23-i)).strftime("%H:00"),
            "events": random.randint(50, 500),
            "alerts": random.randint(5, 50),
        }
        for i in range(24)
    ]
