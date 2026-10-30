"""
SENTINEL-X: AI-Driven Cyber Threat Detection, Attack Path Analysis & Digital Forensics Platform
Main FastAPI Application Entry Point
"""

import asyncio
import json
import logging
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers import (
    auth, incidents, threats, forensics,
    attack_paths, threat_intel, risk_engine,
    dashboard, ai_assistant
)
from core.websocket_manager import WebSocketManager
from core.cyber_range_engine import CyberRangeEngine
from core.detection_engine import DetectionEngine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("SENTINEL-X")

# Global instances
ws_manager = WebSocketManager()
cyber_range = CyberRangeEngine()
detection_engine = DetectionEngine()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown"""
    logger.info("SENTINEL-X Platform Starting...")
    asyncio.create_task(cyber_range.start_simulation(ws_manager))
    asyncio.create_task(detection_engine.start_processing(ws_manager))
    logger.info("SENTINEL-X Platform Ready - All Systems Operational")
    yield
    logger.info("SENTINEL-X Platform Shutting Down...")


app = FastAPI(
    title="SENTINEL-X",
    description="AI-Driven Cyber Threat Detection, Attack Path Analysis & Digital Forensics Platform",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(incidents.router, prefix="/api/incidents", tags=["Incidents"])
app.include_router(threats.router, prefix="/api/threats", tags=["Threat Detection"])
app.include_router(forensics.router, prefix="/api/forensics", tags=["Digital Forensics"])
app.include_router(attack_paths.router, prefix="/api/attack-paths", tags=["Attack Path Analysis"])
app.include_router(threat_intel.router, prefix="/api/threat-intel", tags=["Threat Intelligence"])
app.include_router(risk_engine.router, prefix="/api/risk", tags=["Risk Engine"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["SOC Dashboard"])
app.include_router(ai_assistant.router, prefix="/api/ai", tags=["AI Assistant"])


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            await ws_manager.handle_message(message, websocket)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)


@app.get("/api/health")
async def health_check():
    return {
        "status": "operational",
        "platform": "SENTINEL-X",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "subsystems": {
            "detection_engine": "active",
            "ml_models": "loaded",
            "threat_intel": "connected",
            "forensics_engine": "ready",
            "cyber_range": "running",
            "risk_engine": "operational"
        }
    }


@app.get("/")
async def root():
    return {"message": "SENTINEL-X Platform API", "docs": "/docs"}
