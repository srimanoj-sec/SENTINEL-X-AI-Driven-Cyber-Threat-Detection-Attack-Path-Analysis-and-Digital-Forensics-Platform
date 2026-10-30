"""
SENTINEL-X Core Data Models
Comprehensive threat, incident, forensics, and intelligence data models
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum
import uuid
import random


class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"


class IncidentStatus(str, Enum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    CONTAINED = "CONTAINED"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class ThreatCategory(str, Enum):
    MALWARE = "Malware"
    INTRUSION = "Intrusion"
    EXFILTRATION = "Data Exfiltration"
    LATERAL_MOVEMENT = "Lateral Movement"
    PRIVILEGE_ESCALATION = "Privilege Escalation"
    CREDENTIAL_ACCESS = "Credential Access"
    BRUTE_FORCE = "Brute Force"
    SQL_INJECTION = "SQL Injection"
    XSS = "Cross-Site Scripting"
    RANSOMWARE = "Ransomware"
    APT = "Advanced Persistent Threat"
    DDOS = "DDoS Attack"
    PHISHING = "Phishing"
    ZERO_DAY = "Zero-Day Exploit"
    INSIDER_THREAT = "Insider Threat"


class AttackPhase(str, Enum):
    RECONNAISSANCE = "Reconnaissance"
    INITIAL_ACCESS = "Initial Access"
    EXECUTION = "Execution"
    PERSISTENCE = "Persistence"
    PRIVILEGE_ESCALATION = "Privilege Escalation"
    DEFENSE_EVASION = "Defense Evasion"
    CREDENTIAL_ACCESS = "Credential Access"
    DISCOVERY = "Discovery"
    LATERAL_MOVEMENT = "Lateral Movement"
    COLLECTION = "Collection"
    EXFILTRATION = "Exfiltration"
    IMPACT = "Impact"


# MITRE ATT&CK Techniques Database
MITRE_TECHNIQUES = {
    "T1190": {"name": "Exploit Public-Facing Application", "tactic": "Initial Access", "severity": "HIGH"},
    "T1078": {"name": "Valid Accounts", "tactic": "Initial Access", "severity": "HIGH"},
    "T1566": {"name": "Phishing", "tactic": "Initial Access", "severity": "MEDIUM"},
    "T1059.001": {"name": "PowerShell", "tactic": "Execution", "severity": "HIGH"},
    "T1059.003": {"name": "Windows Command Shell", "tactic": "Execution", "severity": "MEDIUM"},
    "T1053.005": {"name": "Scheduled Task", "tactic": "Persistence", "severity": "MEDIUM"},
    "T1547.001": {"name": "Registry Run Keys", "tactic": "Persistence", "severity": "MEDIUM"},
    "T1548.002": {"name": "Bypass UAC", "tactic": "Privilege Escalation", "severity": "HIGH"},
    "T1055": {"name": "Process Injection", "tactic": "Privilege Escalation", "severity": "HIGH"},
    "T1027": {"name": "Obfuscated Files", "tactic": "Defense Evasion", "severity": "MEDIUM"},
    "T1003.001": {"name": "LSASS Memory", "tactic": "Credential Access", "severity": "CRITICAL"},
    "T1110": {"name": "Brute Force", "tactic": "Credential Access", "severity": "HIGH"},
    "T1021.001": {"name": "Remote Desktop Protocol", "tactic": "Lateral Movement", "severity": "HIGH"},
    "T1021.002": {"name": "SMB/Windows Admin Shares", "tactic": "Lateral Movement", "severity": "HIGH"},
    "T1560.001": {"name": "Archive Collected Data", "tactic": "Collection", "severity": "MEDIUM"},
    "T1041": {"name": "Exfiltration Over C2 Channel", "tactic": "Exfiltration", "severity": "CRITICAL"},
    "T1071.001": {"name": "Web Protocols", "tactic": "Command and Control", "severity": "HIGH"},
    "T1486": {"name": "Data Encrypted for Impact", "tactic": "Impact", "severity": "CRITICAL"},
    "T1595": {"name": "Active Scanning", "tactic": "Reconnaissance", "severity": "LOW"},
    "T1046": {"name": "Network Service Discovery", "tactic": "Discovery", "severity": "LOW"},
    "T1083": {"name": "File and Directory Discovery", "tactic": "Discovery", "severity": "LOW"},
    "T1505.003": {"name": "Web Shell", "tactic": "Persistence", "severity": "CRITICAL"},
    "T1133": {"name": "External Remote Services", "tactic": "Initial Access", "severity": "HIGH"},
}


# Simulated threat actors
THREAT_ACTORS = [
    {"name": "APT29 (Cozy Bear)", "origin": "Russia", "sophistication": "Nation-State"},
    {"name": "APT41", "origin": "China", "sophistication": "Nation-State"},
    {"name": "Lazarus Group", "origin": "North Korea", "sophistication": "Nation-State"},
    {"name": "FIN7", "origin": "Unknown", "sophistication": "Criminal"},
    {"name": "REvil", "origin": "Eastern Europe", "sophistication": "Criminal"},
    {"name": "LockBit", "origin": "Unknown", "sophistication": "Criminal"},
    {"name": "Anonymous Threat Actor", "origin": "Unknown", "sophistication": "Unknown"},
]

# Attack scenario templates
ATTACK_SCENARIOS = [
    {
        "name": "SQL Injection → DB Dump",
        "phases": ["T1190", "T1059.003", "T1003.001", "T1041"],
        "target": "Web Application",
        "severity": "CRITICAL"
    },
    {
        "name": "Phishing → Ransomware",
        "phases": ["T1566", "T1059.001", "T1547.001", "T1486"],
        "target": "Endpoint",
        "severity": "CRITICAL"
    },
    {
        "name": "Brute Force → Lateral Movement",
        "phases": ["T1110", "T1078", "T1021.001", "T1083"],
        "target": "Active Directory",
        "severity": "HIGH"
    },
    {
        "name": "Web Shell → Privilege Escalation",
        "phases": ["T1190", "T1505.003", "T1548.002", "T1003.001"],
        "target": "Web Server",
        "severity": "CRITICAL"
    },
    {
        "name": "Port Scan → Service Exploitation",
        "phases": ["T1595", "T1046", "T1190", "T1059.001"],
        "target": "Network",
        "severity": "HIGH"
    },
    {
        "name": "APT Data Exfiltration",
        "phases": ["T1078", "T1021.002", "T1560.001", "T1041"],
        "target": "File Server",
        "severity": "CRITICAL"
    },
]

# Simulated network assets
NETWORK_ASSETS = [
    {"id": "web-01", "name": "Web Server", "ip": "10.0.1.10", "type": "Web Server", "criticality": "HIGH", "os": "Ubuntu 22.04"},
    {"id": "app-01", "name": "Application Server", "ip": "10.0.1.20", "type": "App Server", "criticality": "HIGH", "os": "CentOS 8"},
    {"id": "db-01", "name": "Database Server", "ip": "10.0.2.10", "type": "Database", "criticality": "CRITICAL", "os": "PostgreSQL/Linux"},
    {"id": "ad-01", "name": "Active Directory", "ip": "10.0.3.10", "type": "Domain Controller", "criticality": "CRITICAL", "os": "Windows Server 2019"},
    {"id": "fs-01", "name": "File Server", "ip": "10.0.3.20", "type": "File Server", "criticality": "HIGH", "os": "Windows Server 2019"},
    {"id": "ws-01", "name": "Workstation-HR", "ip": "10.0.4.10", "type": "Workstation", "criticality": "MEDIUM", "os": "Windows 11"},
    {"id": "fw-01", "name": "Firewall", "ip": "10.0.0.1", "type": "Network Device", "criticality": "CRITICAL", "os": "Palo Alto PAN-OS"},
    {"id": "vpn-01", "name": "VPN Gateway", "ip": "203.0.113.1", "type": "VPN", "criticality": "HIGH", "os": "Cisco ASA"},
]

# Known malicious IPs (simulated)
MALICIOUS_IPS = {
    "185.220.101.45": {"reputation": "MALICIOUS", "country": "Russia", "asn": "AS396303", "threats": ["TOR Exit Node", "Port Scanner"]},
    "45.33.32.156": {"reputation": "SUSPICIOUS", "country": "United States", "asn": "AS63949", "threats": ["Known C2"]},
    "198.20.69.74": {"reputation": "MALICIOUS", "country": "China", "asn": "AS4134", "threats": ["Botnet", "Scanner"]},
    "178.128.55.23": {"reputation": "SUSPICIOUS", "country": "Netherlands", "asn": "AS14061", "threats": ["Anonymous Proxy"]},
    "91.108.4.168": {"reputation": "MALICIOUS", "country": "Germany", "asn": "AS62041", "threats": ["Malware Distribution"]},
    "103.35.74.99": {"reputation": "MALICIOUS", "country": "Hong Kong", "asn": "AS58461", "threats": ["APT Infrastructure", "C2 Server"]},
    "5.188.206.26": {"reputation": "MALICIOUS", "country": "Russia", "asn": "AS49877", "threats": ["Brute Force", "Scanner"]},
}


def generate_incident_id() -> str:
    now = datetime.now()
    return f"INC-{now.year}-{random.randint(1000, 9999)}"


def generate_evidence_id() -> str:
    return f"EVD-{random.randint(1000, 9999)}"


def generate_sha256() -> str:
    import hashlib
    return hashlib.sha256(uuid.uuid4().bytes).hexdigest()
