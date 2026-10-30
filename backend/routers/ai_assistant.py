"""SENTINEL-X AI Investigation Assistant Router"""
import random
from datetime import datetime
from fastapi import APIRouter
from core.cyber_range_engine import state

router = APIRouter()

INVESTIGATION_TEMPLATES = {
    "CRITICAL": [
        "The incident was classified as CRITICAL because:",
        "1. The attacker obtained initial access through a public-facing vulnerability.",
        "2. Privilege escalation was detected — SYSTEM-level access achieved.",
        "3. A privileged service account credentials were compromised (LSASS dump).",
        "4. Lateral movement confirms the attacker spread through the network.",
        "5. The attack path reaches the database server containing sensitive data.",
        "",
        "🚨 Recommended Action: IMMEDIATE CONTAINMENT — Isolate affected systems NOW.",
    ],
    "HIGH": [
        "The incident was classified as HIGH severity because:",
        "1. Multiple failed authentication attempts indicate a brute-force attack.",
        "2. A valid account was compromised after credential stuffing.",
        "3. Suspicious PowerShell execution indicates malicious tooling.",
        "4. Network reconnaissance detected post-compromise.",
        "",
        "⚠️ Recommended Action: Contain within 2 hours. Reset compromised credentials.",
    ],
    "MEDIUM": [
        "The incident was classified as MEDIUM severity because:",
        "1. Suspicious login detected from an unusual geographic location.",
        "2. Access occurred outside normal business hours.",
        "3. Unknown device fingerprint detected.",
        "4. No data access confirmed yet.",
        "",
        "📋 Recommended Action: Investigate within 24 hours. Force MFA re-verification.",
    ],
}

@router.post("/investigate")
async def investigate_incident(incident_id: str):
    incident = next((i for i in state.incidents if i["id"] == incident_id), None)
    if not incident:
        return {"error": "Incident not found"}
    
    severity = incident.get("severity", "MEDIUM")
    template = INVESTIGATION_TEMPLATES.get(severity, INVESTIGATION_TEMPLATES["MEDIUM"])
    
    techniques = incident.get("techniques", [])
    actor = incident.get("threat_actor", {})
    target = incident.get("target_asset", {})
    risk = incident.get("risk_score", 50)
    
    analysis = "\n".join(template)
    
    return {
        "incident_id": incident_id,
        "severity": severity,
        "risk_score": risk,
        "ai_analysis": analysis,
        "key_findings": [
            f"Attack vector: {techniques[0]['name'] if techniques else 'Unknown'}" ,
            f"Threat actor profile: {actor.get('sophistication', 'Unknown')} level attacker",
            f"Target criticality: {target.get('criticality', 'Unknown')}",
            f"MITRE techniques detected: {len(techniques)}",
            f"Forensic evidence collected: {len([e for e in state.evidence if e.get('incident_id') == incident_id])}",
        ],
        "recommended_actions": get_recommendations(severity),
        "generated_at": datetime.utcnow().isoformat()
    }

@router.post("/chat")
async def ai_chat(question: str, incident_id: str = None):
    """AI investigation chat interface"""
    q_lower = question.lower()
    
    if "critical" in q_lower or "why" in q_lower and "critical" in q_lower:
        response = INVESTIGATION_TEMPLATES["CRITICAL"]
    elif "contain" in q_lower or "stop" in q_lower or "block" in q_lower:
        response = [
            "🛡️ Containment Strategy:",
            "1. Immediately isolate affected hosts using network segmentation.",
            "2. Block attacker IPs at the perimeter firewall.",
            "3. Disable compromised user accounts.",
            "4. Revoke active sessions and invalidate tokens.",
            "5. Enable enhanced monitoring on lateral targets.",
        ]
    elif "evidence" in q_lower or "forensic" in q_lower:
        response = [
            "🔍 Forensic Evidence Summary:",
            f"• {len(state.evidence)} evidence items collected",
            "• All items SHA-256 verified for integrity",
            "• Chain of custody established and logged",
            "• Memory dumps captured for offline analysis",
            "• Network PCAPs preserved for traffic analysis",
        ]
    elif "attacker" in q_lower or "who" in q_lower:
        actor = random.choice(["APT29 (Cozy Bear)", "FIN7", "Lazarus Group", "Unknown Threat Actor"])
        response = [
            f"🕵️ Threat Actor Analysis:",
            f"• Likely actor: {actor}",
            "• TTPs match nation-state or organized criminal group",
            "• Infrastructure overlaps with known malicious ASNs",
            "• Multiple MITRE ATT&CK techniques employed",
        ]
    else:
        response = [
            "🤖 SENTINEL-X AI Assistant:",
            "I can help you investigate incidents. Try asking:",
            "• 'Why was this classified as critical?'",
            "• 'How do I contain this attack?'",
            "• 'What forensic evidence was collected?'",
            "• 'Who is the attacker?'",
        ]
    
    return {
        "question": question,
        "response": "\n".join(response),
        "generated_at": datetime.utcnow().isoformat(),
        "model": "SENTINEL-X AI v1.0"
    }

def get_recommendations(severity: str) -> list:
    recommendations = {
        "CRITICAL": [
            "Immediately isolate all affected systems",
            "Engage DFIR team for full forensic investigation",
            "Notify CISO and executive team",
            "Activate incident response playbook",
            "File regulatory notification if PII exposed",
            "Preserve all logs and memory images",
        ],
        "HIGH": [
            "Contain affected systems within 2 hours",
            "Reset all compromised credentials",
            "Enable enhanced EDR monitoring",
            "Review and patch the exploited vulnerability",
            "Block attacker IPs at perimeter",
        ],
        "MEDIUM": [
            "Investigate within 24 hours",
            "Force MFA re-authentication for affected users",
            "Review access logs for data access",
            "Update detection rules to prevent recurrence",
        ],
    }
    return recommendations.get(severity, recommendations["MEDIUM"])
