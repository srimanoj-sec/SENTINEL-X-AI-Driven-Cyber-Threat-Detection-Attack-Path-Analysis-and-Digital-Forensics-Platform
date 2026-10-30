"""
SENTINEL-X Cyber Range Engine
Simulates controlled attack scenarios to test detection capabilities
"""

import asyncio
import random
import uuid
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from fastapi import APIRouter

from core.models import (
    ATTACK_SCENARIOS, MITRE_TECHNIQUES, NETWORK_ASSETS,
    MALICIOUS_IPS, THREAT_ACTORS, generate_incident_id,
    generate_evidence_id, generate_sha256
)

logger = logging.getLogger("SENTINEL-X.CyberRange")

router = APIRouter()

# Shared state store
class StateStore:
    incidents: List[Dict] = []
    events: List[Dict] = []
    evidence: List[Dict] = []
    active_attacks: List[Dict] = []
    timeline_events: List[Dict] = []
    ioc_store: List[Dict] = []
    attack_paths: List[Dict] = []


state = StateStore()


def get_random_attacker_ip() -> str:
    malicious = list(MALICIOUS_IPS.keys())
    random_ips = [
        f"{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,254)}"
        for _ in range(5)
    ]
    return random.choice(malicious + random_ips)


def generate_log_entry(event_type: str, source_ip: str, target: Dict, technique_id: str) -> Dict:
    technique = MITRE_TECHNIQUES.get(technique_id, {})
    return {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "source_ip": source_ip,
        "target_ip": target.get("ip"),
        "target_name": target.get("name"),
        "technique_id": technique_id,
        "technique_name": technique.get("name", "Unknown"),
        "tactic": technique.get("tactic", "Unknown"),
        "severity": technique.get("severity", "MEDIUM"),
        "log_source": random.choice(["Windows Event", "Firewall", "IDS", "SIEM", "Web Proxy"]),
        "raw_log": generate_raw_log(event_type, source_ip, target.get("ip", ""), technique_id)
    }


def generate_raw_log(event_type: str, src_ip: str, dst_ip: str, technique: str) -> str:
    logs = {
        "port_scan": f"[{datetime.utcnow()}] ALERT: Port scan detected from {src_ip} -> {dst_ip} | Ports: 22,80,443,3389,8080",
        "brute_force": f"[{datetime.utcnow()}] FAILED LOGIN: Multiple authentication failures from {src_ip} -> {dst_ip} | Count: {random.randint(50,500)}",
        "web_attack": f"[{datetime.utcnow()}] WEB: {src_ip} -> {dst_ip} GET /admin?id=1' OR 1=1-- HTTP/1.1 200",
        "privilege_escalation": f"[{datetime.utcnow()}] PROCESS: svchost.exe spawned cmd.exe with SYSTEM privileges on {dst_ip}",
        "lateral_movement": f"[{datetime.utcnow()}] SMB: {src_ip} -> {dst_ip} Connected to ADMIN$ share | User: DOMAIN\\svc_backup",
        "data_exfiltration": f"[{datetime.utcnow()}] TRANSFER: {src_ip} -> {dst_ip} 847MB upload detected | Proto: HTTPS",
        "malware_execution": f"[{datetime.utcnow()}] EXEC: powershell.exe -enc {generate_sha256()[:32]} | Parent: cmd.exe",
        "credential_dump": f"[{datetime.utcnow()}] LSASS: Process 'mimikatz.exe' accessed lsass.exe memory on {dst_ip}",
    }
    return logs.get(event_type, f"[{datetime.utcnow()}] SECURITY EVENT: {event_type} from {src_ip} -> {dst_ip}")


def generate_attack_path(scenario: Dict) -> Dict:
    """Generate visual attack path graph for a scenario"""
    nodes = []
    edges = []
    
    # Add internet source node
    nodes.append({"id": "internet", "label": "Internet\nAttacker", "type": "attacker", "ip": get_random_attacker_ip()})
    
    # Generate path through assets
    path_assets = random.sample(NETWORK_ASSETS[:5], min(3, len(NETWORK_ASSETS[:5])))
    prev_id = "internet"
    
    for i, asset in enumerate(path_assets):
        node_id = asset["id"]
        nodes.append({
            "id": node_id,
            "label": asset["name"],
            "type": asset["type"],
            "ip": asset["ip"],
            "criticality": asset["criticality"],
            "compromised": True
        })
        edges.append({
            "source": prev_id,
            "target": node_id,
            "technique": scenario["phases"][min(i, len(scenario["phases"])-1)],
            "label": MITRE_TECHNIQUES.get(scenario["phases"][min(i, len(scenario["phases"])-1)], {}).get("name", "Attack")
        })
        prev_id = node_id
    
    # Add sensitive data node
    nodes.append({"id": "data", "label": "Sensitive Data\nExfiltrated", "type": "data", "criticality": "CRITICAL"})
    edges.append({"source": prev_id, "target": "data", "technique": "T1041", "label": "Exfiltration"})
    
    return {"nodes": nodes, "edges": edges, "risk_score": random.randint(75, 98)}


def generate_forensic_evidence(incident_id: str, source_ip: str, technique_id: str) -> List[Dict]:
    """Generate forensic evidence for an incident"""
    evidence_items = []
    
    evidence_types = [
        {"type": "Malware Sample", "filename": f"payload_{random.randint(1000,9999)}.exe", "category": "executable"},
        {"type": "Memory Dump", "filename": f"lsass_{random.randint(1000,9999)}.dmp", "category": "memory"},
        {"type": "Network Capture", "filename": f"capture_{random.randint(1000,9999)}.pcap", "category": "network"},
        {"type": "Log File", "filename": f"security_{random.randint(1000,9999)}.evtx", "category": "log"},
        {"type": "Registry Hive", "filename": f"SYSTEM_{random.randint(1000,9999)}.reg", "category": "registry"},
    ]
    
    count = random.randint(2, 4)
    for ev_type in random.sample(evidence_types, count):
        sha256 = generate_sha256()
        evd = {
            "id": generate_evidence_id(),
            "incident_id": incident_id,
            "type": ev_type["type"],
            "filename": ev_type["filename"],
            "sha256": sha256,
            "md5": hashlib.md5(sha256.encode()).hexdigest(),
            "size": random.randint(1024, 50*1024*1024),
            "collected_at": datetime.utcnow().isoformat(),
            "source_ip": source_ip,
            "integrity": "VALID",
            "chain_of_custody": [
                {"action": "Acquired", "by": "SENTINEL-X Auto-Collector", "timestamp": datetime.utcnow().isoformat()},
                {"action": "Hashed", "by": "Forensics Engine", "timestamp": datetime.utcnow().isoformat()},
            ],
            "metadata": {
                "created": (datetime.utcnow() - timedelta(hours=random.randint(1,24))).isoformat(),
                "modified": datetime.utcnow().isoformat(),
                "category": ev_type["category"],
                "ioc_extracted": True
            }
        }
        evidence_items.append(evd)
    
    return evidence_items


def calculate_risk_score(severity: str, asset_criticality: str, techniques: List[str]) -> Dict:
    """Calculate comprehensive risk score"""
    base_scores = {"CRITICAL": 40, "HIGH": 30, "MEDIUM": 20, "LOW": 10}
    criticality_scores = {"CRITICAL": 25, "HIGH": 20, "MEDIUM": 15, "LOW": 5}
    
    base = base_scores.get(severity, 20)
    criticality = criticality_scores.get(asset_criticality, 15)
    technique_score = min(len(techniques) * 5, 20)
    threat_intel = random.randint(5, 15)
    
    total = base + criticality + technique_score + threat_intel
    total = min(total, 100)
    
    if total >= 85:
        severity_label = "CRITICAL"
    elif total >= 70:
        severity_label = "HIGH"
    elif total >= 50:
        severity_label = "MEDIUM"
    else:
        severity_label = "LOW"
    
    reasons = []
    if asset_criticality == "CRITICAL":
        reasons.append("Critical infrastructure asset targeted")
    if len(techniques) > 3:
        reasons.append(f"Multi-stage attack chain ({len(techniques)} techniques)")
    if threat_intel > 12:
        reasons.append("Known threat actor TTPs matched")
    reasons.append(f"CVSS-equivalent base score: {base}")
    
    return {
        "score": total,
        "severity": severity_label,
        "breakdown": {
            "base_severity": base,
            "asset_criticality": criticality,
            "technique_complexity": technique_score,
            "threat_intel": threat_intel
        },
        "reasons": reasons
    }


def generate_incident_timeline(phases: List[str]) -> List[Dict]:
    """Generate attack incident timeline"""
    timeline = []
    current_time = datetime.utcnow() - timedelta(minutes=len(phases) * 3)
    
    phase_events = {
        "T1595": "Active Scanning Detected",
        "T1046": "Network Port Scan",
        "T1190": "Exploit Attempt on Public Service",
        "T1566": "Phishing Email Delivered",
        "T1078": "Valid Account Used",
        "T1059.001": "Malicious PowerShell Executed",
        "T1059.003": "CMD Shell Spawned",
        "T1505.003": "Web Shell Installed",
        "T1547.001": "Registry Persistence Set",
        "T1053.005": "Scheduled Task Created",
        "T1548.002": "UAC Bypass Attempted",
        "T1055": "Process Injection",
        "T1003.001": "LSASS Credential Dump",
        "T1110": "Brute Force Attack",
        "T1021.001": "RDP Lateral Movement",
        "T1021.002": "SMB Lateral Movement",
        "T1083": "File System Discovery",
        "T1560.001": "Data Archive Created",
        "T1041": "Data Exfiltration via C2",
        "T1486": "Ransomware Encryption Started",
    }
    
    for i, phase in enumerate(phases):
        current_time += timedelta(minutes=random.randint(1, 5), seconds=random.randint(0, 59))
        timeline.append({
            "id": str(uuid.uuid4()),
            "timestamp": current_time.isoformat(),
            "technique_id": phase,
            "technique_name": MITRE_TECHNIQUES.get(phase, {}).get("name", "Unknown"),
            "event": phase_events.get(phase, f"Attack Phase: {phase}"),
            "tactic": MITRE_TECHNIQUES.get(phase, {}).get("tactic", "Unknown"),
            "severity": MITRE_TECHNIQUES.get(phase, {}).get("severity", "MEDIUM"),
        })
    
    return timeline


async def simulate_attack(scenario: Dict, ws_manager) -> Dict:
    """Execute a full attack simulation"""
    logger.info(f"Simulating attack: {scenario['name']}")
    
    attacker_ip = get_random_attacker_ip()
    target_asset = random.choice(NETWORK_ASSETS[:4])
    threat_actor = random.choice(THREAT_ACTORS)
    incident_id = generate_incident_id()
    
    # Generate timeline
    timeline = generate_incident_timeline(scenario["phases"])
    
    # Generate forensic evidence
    evidence = generate_forensic_evidence(incident_id, attacker_ip, scenario["phases"][0])
    
    # Calculate risk
    risk = calculate_risk_score(scenario["severity"], target_asset["criticality"], scenario["phases"])
    
    # Generate attack path
    attack_path = generate_attack_path(scenario)
    
    # Generate IOCs
    iocs = [
        {"type": "IP", "value": attacker_ip, "threat_score": random.randint(70, 99), "tags": ["malicious", "attacker"]},
        {"type": "hash", "value": generate_sha256(), "threat_score": random.randint(80, 99), "tags": ["malware"]},
        {"type": "domain", "value": f"c2-{random.randint(1000,9999)}.{random.choice(['evil.com','badactor.net','threat.org'])}", "threat_score": random.randint(75, 95), "tags": ["c2", "malware"]},
    ]
    
    # Build full incident
    incident = {
        "id": incident_id,
        "title": scenario["name"],
        "description": f"Detected multi-stage attack: {scenario['name']} targeting {target_asset['name']}",
        "severity": risk["severity"],
        "risk_score": risk["score"],
        "risk_breakdown": risk,
        "status": "OPEN",
        "threat_actor": threat_actor,
        "attacker_ip": attacker_ip,
        "target_asset": target_asset,
        "techniques": [
            {
                "id": t,
                "name": MITRE_TECHNIQUES.get(t, {}).get("name", "Unknown"),
                "tactic": MITRE_TECHNIQUES.get(t, {}).get("tactic", "Unknown"),
                "severity": MITRE_TECHNIQUES.get(t, {}).get("severity", "MEDIUM")
            }
            for t in scenario["phases"]
        ],
        "timeline": timeline,
        "evidence": evidence,
        "attack_path": attack_path,
        "iocs": iocs,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "mitre_phases": list(set([MITRE_TECHNIQUES.get(t, {}).get("tactic", "") for t in scenario["phases"]])),
    }
    
    # Store in state
    state.incidents.append(incident)
    state.evidence.extend(evidence)
    state.ioc_store.extend(iocs)
    state.timeline_events.extend(timeline)
    state.attack_paths.append(attack_path)
    
    # Broadcast to WebSocket
    if ws_manager:
        await ws_manager.broadcast({
            "type": "new_incident",
            "incident": incident,
            "message": f"🚨 NEW {risk['severity']} INCIDENT: {scenario['name']}"
        })
        
        # Broadcast timeline events with delay
        for event in timeline[:3]:
            await ws_manager.broadcast({
                "type": "timeline_event",
                "event": event,
                "incident_id": incident_id
            })
            await asyncio.sleep(0.5)
    
    return incident


class CyberRangeEngine:
    """Cyber Range - Controlled Attack Simulation Environment"""
    
    def __init__(self):
        self.running = False
        self.simulation_interval = 45  # seconds between attacks
    
    async def start_simulation(self, ws_manager):
        """Start continuous attack simulation"""
        self.running = True
        logger.info("Cyber Range Engine Started")
        
        # Generate initial incidents
        for scenario in random.sample(ATTACK_SCENARIOS, min(4, len(ATTACK_SCENARIOS))):
            await simulate_attack(scenario, None)
            await asyncio.sleep(0.1)
        
        # Continuous simulation
        while self.running:
            await asyncio.sleep(self.simulation_interval)
            scenario = random.choice(ATTACK_SCENARIOS)
            await simulate_attack(scenario, ws_manager)
    
    def stop_simulation(self):
        self.running = False


# API Routes
@router.get("/status")
async def get_cyber_range_status():
    return {
        "status": "running",
        "incidents_generated": len(state.incidents),
        "evidence_collected": len(state.evidence),
        "iocs_detected": len(state.ioc_store),
        "scenarios": [s["name"] for s in ATTACK_SCENARIOS]
    }


@router.post("/trigger/{scenario_name}")
async def trigger_attack(scenario_name: str):
    """Manually trigger a specific attack scenario"""
    scenario = next((s for s in ATTACK_SCENARIOS if s["name"] == scenario_name), None)
    if not scenario:
        scenario = random.choice(ATTACK_SCENARIOS)
    
    incident = await simulate_attack(scenario, None)
    return {"message": "Attack simulation triggered", "incident_id": incident["id"]}
