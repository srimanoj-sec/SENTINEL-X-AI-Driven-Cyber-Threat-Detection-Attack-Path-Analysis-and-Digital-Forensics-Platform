"""
SENTINEL-X Detection Engine
ML-based anomaly detection using Isolation Forest + statistical methods
"""

import asyncio
import random
import uuid
import logging
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler

from core.models import MITRE_TECHNIQUES, NETWORK_ASSETS, MALICIOUS_IPS

logger = logging.getLogger("SENTINEL-X.Detection")


class MLAnomalyDetector:
    """Multi-model anomaly detection engine"""
    
    def __init__(self):
        self.isolation_forest = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100
        )
        self.scaler = StandardScaler()
        self.trained = False
        self.behavioral_baselines = {}
        self._train_models()
    
    def _generate_training_data(self) -> np.ndarray:
        """Generate synthetic normal behavior training data"""
        n_samples = 1000
        # Features: hour, day_of_week, login_count, bytes_transferred, unique_ips, failed_logins
        normal_data = np.column_stack([
            np.random.normal(10, 3, n_samples),      # hour (business hours)
            np.random.randint(0, 5, n_samples),       # weekday (0-4)
            np.random.normal(5, 2, n_samples),        # login count
            np.random.normal(10, 5, n_samples),       # MB transferred
            np.random.normal(3, 1, n_samples),        # unique IPs
            np.random.normal(1, 0.5, n_samples),      # failed logins
        ])
        return normal_data
    
    def _train_models(self):
        """Train ML models on synthetic baseline data"""
        training_data = self._generate_training_data()
        scaled_data = self.scaler.fit_transform(training_data)
        self.isolation_forest.fit(scaled_data)
        self.trained = True
        logger.info("ML Detection models trained successfully")
    
    def detect_anomaly(self, event_features: Dict) -> Dict:
        """Run anomaly detection on event features"""
        features = np.array([[
            event_features.get("hour", 12),
            event_features.get("day_of_week", 2),
            event_features.get("login_count", 5),
            event_features.get("bytes_mb", 10),
            event_features.get("unique_ips", 3),
            event_features.get("failed_logins", 1),
        ]])
        
        scaled = self.scaler.transform(features)
        anomaly_score = self.isolation_forest.decision_function(scaled)[0]
        is_anomaly = self.isolation_forest.predict(scaled)[0] == -1
        
        # Normalize score to 0-100
        confidence = min(100, max(0, int((1 - (anomaly_score + 1) / 2) * 100)))
        
        return {
            "is_anomaly": bool(is_anomaly),
            "confidence": confidence,
            "anomaly_score": float(anomaly_score),
            "method": "Isolation Forest",
        }
    
    def check_behavioral_baseline(self, user: str, hour: int, country: str, device: str) -> Dict:
        """Check for impossible travel and behavioral anomalies"""
        baseline = self.behavioral_baselines.get(user, {
            "normal_hours": [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
            "normal_country": "India",
            "known_devices": ["laptop-corp-01", "workstation-2"]
        })
        
        anomalies = []
        risk_factors = 0
        
        # Check impossible travel
        if country != baseline["normal_country"]:
            anomalies.append(f"Impossible travel: Login from {country} (normal: {baseline['normal_country']})")
            risk_factors += 40
        
        # Check odd hours
        if hour not in baseline["normal_hours"]:
            anomalies.append(f"Off-hours access: {hour:02d}:xx (normal: 08:00-17:00)")
            risk_factors += 20
        
        # Check unknown device
        if device not in baseline["known_devices"]:
            anomalies.append(f"Unknown device: {device}")
            risk_factors += 30
        
        return {
            "user": user,
            "anomalies": anomalies,
            "risk_factors": risk_factors,
            "is_suspicious": risk_factors > 30,
            "risk_level": "HIGH" if risk_factors > 60 else "MEDIUM" if risk_factors > 30 else "LOW"
        }


class DetectionEngine:
    """Main detection engine - processes events and generates alerts"""
    
    def __init__(self):
        self.ml_detector = MLAnomalyDetector()
        self.running = False
        self.processed_events = []
        self.rule_alerts = []
    
    def check_ip_reputation(self, ip: str) -> Dict:
        """Check if IP is in threat intelligence feed"""
        if ip in MALICIOUS_IPS:
            intel = MALICIOUS_IPS[ip]
            return {
                "ip": ip,
                "is_malicious": True,
                "reputation": intel["reputation"],
                "country": intel["country"],
                "asn": intel["asn"],
                "threats": intel["threats"],
                "threat_score": random.randint(70, 99)
            }
        return {
            "ip": ip,
            "is_malicious": False,
            "reputation": "CLEAN",
            "country": random.choice(["Unknown", "United States", "Germany"]),
            "threat_score": random.randint(0, 25)
        }
    
    def apply_detection_rules(self, event: Dict) -> List[Dict]:
        """Apply signature-based detection rules"""
        alerts = []
        raw_log = event.get("raw_log", "").lower()
        
        rules = [
            {
                "rule_id": "RULE-001",
                "name": "SQL Injection Attempt",
                "pattern": ["or 1=1", "union select", "' or '", "1=1--"],
                "severity": "HIGH",
                "technique": "T1190"
            },
            {
                "rule_id": "RULE-002",
                "name": "PowerShell Encoded Command",
                "pattern": ["-enc ", "-encodedcommand", "powershell -w hidden"],
                "severity": "HIGH",
                "technique": "T1059.001"
            },
            {
                "rule_id": "RULE-003",
                "name": "LSASS Memory Access",
                "pattern": ["lsass", "mimikatz", "credential dump"],
                "severity": "CRITICAL",
                "technique": "T1003.001"
            },
            {
                "rule_id": "RULE-004",
                "name": "Brute Force Login",
                "pattern": ["multiple authentication failures", "failed login", "count: 5"],
                "severity": "HIGH",
                "technique": "T1110"
            },
            {
                "rule_id": "RULE-005",
                "name": "SMB Lateral Movement",
                "pattern": ["admin$", "smb", "\\\\"],
                "severity": "HIGH",
                "technique": "T1021.002"
            },
        ]
        
        for rule in rules:
            if any(p in raw_log for p in rule["pattern"]):
                alerts.append({
                    "rule_id": rule["rule_id"],
                    "rule_name": rule["name"],
                    "severity": rule["severity"],
                    "technique": rule["technique"],
                    "triggered_at": datetime.utcnow().isoformat()
                })
        
        return alerts
    
    async def start_processing(self, ws_manager):
        """Start event processing loop"""
        self.running = True
        logger.info("Detection Engine started")
        
        while self.running:
            await asyncio.sleep(15)
            
            # Generate a synthetic event for continuous detection demo
            event = self._generate_synthetic_event()
            self.processed_events.append(event)
            
            # Run detection
            anomaly = self.ml_detector.detect_anomaly({
                "hour": event.get("hour", 12),
                "day_of_week": event.get("day_of_week", 2),
                "login_count": event.get("login_count", 5),
                "bytes_mb": event.get("bytes_mb", 10),
                "unique_ips": event.get("unique_ips", 3),
                "failed_logins": event.get("failed_logins", 1),
            })
            
            if anomaly["is_anomaly"]:
                alert = {
                    "id": str(uuid.uuid4()),
                    "type": "anomaly_detected",
                    "event": event,
                    "anomaly": anomaly,
                    "timestamp": datetime.utcnow().isoformat(),
                    "message": f"ML Anomaly detected: confidence {anomaly['confidence']}%"
                }
                
                if ws_manager:
                    await ws_manager.broadcast(alert)
    
    def _generate_synthetic_event(self) -> Dict:
        """Generate synthetic network/auth event"""
        is_attack = random.random() < 0.3  # 30% chance of suspicious event
        
        if is_attack:
            return {
                "id": str(uuid.uuid4()),
                "hour": random.choice([2, 3, 4, 23, 0, 1]),
                "day_of_week": random.randint(0, 6),
                "login_count": random.randint(50, 500),
                "bytes_mb": random.randint(500, 5000),
                "unique_ips": random.randint(10, 100),
                "failed_logins": random.randint(20, 200),
                "source_ip": random.choice(list(MALICIOUS_IPS.keys())),
                "country": random.choice(["Russia", "China", "North Korea", "Iran"]),
                "is_simulated_attack": True
            }
        else:
            return {
                "id": str(uuid.uuid4()),
                "hour": random.randint(8, 18),
                "day_of_week": random.randint(0, 4),
                "login_count": random.randint(1, 10),
                "bytes_mb": random.randint(1, 100),
                "unique_ips": random.randint(1, 5),
                "failed_logins": random.randint(0, 2),
                "source_ip": f"10.0.{random.randint(1,4)}.{random.randint(1,50)}",
                "country": "India",
                "is_simulated_attack": False
            }
