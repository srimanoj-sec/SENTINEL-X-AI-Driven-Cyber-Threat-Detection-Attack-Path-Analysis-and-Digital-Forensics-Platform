"""
SENTINEL-X WebSocket Manager
Handles real-time bidirectional communication for threat alerts
"""

import json
import logging
from datetime import datetime
from typing import List, Dict, Any
from fastapi import WebSocket

logger = logging.getLogger("SENTINEL-X.WebSocket")


class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.message_history: List[Dict] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Active connections: {len(self.active_connections)}")
        
        # Send recent history to new connections
        for msg in self.message_history[-20:]:
            try:
                await websocket.send_text(json.dumps(msg))
            except Exception:
                pass

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast message to all connected clients"""
        message["timestamp"] = datetime.utcnow().isoformat()
        self.message_history.append(message)
        
        # Keep last 100 messages
        if len(self.message_history) > 100:
            self.message_history = self.message_history[-100:]
        
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting to connection: {e}")
                disconnected.append(connection)
        
        for conn in disconnected:
            self.disconnect(conn)

    async def handle_message(self, message: Dict, websocket: WebSocket):
        """Handle incoming WebSocket messages"""
        msg_type = message.get("type", "")
        
        if msg_type == "ping":
            await websocket.send_text(json.dumps({"type": "pong", "timestamp": datetime.utcnow().isoformat()}))
        elif msg_type == "subscribe":
            await websocket.send_text(json.dumps({
                "type": "subscribed",
                "channel": message.get("channel", "all"),
                "timestamp": datetime.utcnow().isoformat()
            }))
