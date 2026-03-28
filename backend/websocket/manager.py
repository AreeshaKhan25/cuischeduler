from typing import List, Dict, Any
from fastapi import WebSocket
import json


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal(self, message: Dict[str, Any], websocket: WebSocket):
        await websocket.send_text(json.dumps(message, default=str))

    async def broadcast(self, event: str, data: Dict[str, Any]):
        message = {
            "event": event,
            "data": data,
        }
        text = json.dumps(message, default=str)
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(text)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)

    async def broadcast_booking_created(self, booking_data: Dict[str, Any]):
        await self.broadcast("booking_created", {
            **booking_data,
            "os_concept_note": "New process created and added to the system. Like fork() in Unix, a new process enters the 'new' state.",
        })

    async def broadcast_booking_state_changed(self, booking_data: Dict[str, Any], old_state: str, new_state: str):
        await self.broadcast("booking_state_changed", {
            **booking_data,
            "old_state": old_state,
            "new_state": new_state,
            "os_concept_note": f"Process state transition: {old_state} -> {new_state}. This mirrors the OS process state diagram where processes move between new, ready, running, waiting, and terminated states.",
        })

    async def broadcast_deadlock_detected(self, deadlock_data: Dict[str, Any]):
        await self.broadcast("deadlock_detected", {
            **deadlock_data,
            "os_concept_note": "Deadlock detected! Circular wait found in the Resource Allocation Graph. The system requires intervention (process termination, resource preemption, or rollback) to recover.",
        })

    async def broadcast_scheduling_complete(self, result_data: Dict[str, Any]):
        await self.broadcast("scheduling_complete", {
            **result_data,
            "os_concept_note": "Scheduling algorithm execution complete. Process states updated based on algorithm decisions.",
        })

    async def broadcast_resource_updated(self, resource_data: Dict[str, Any]):
        await self.broadcast("resource_updated", {
            **resource_data,
            "os_concept_note": "Resource state changed - like a device status update in the OS device table.",
        })

    async def broadcast_notification(self, notification_data: Dict[str, Any]):
        await self.broadcast("notification", {
            **notification_data,
            "os_concept_note": "IPC message sent via the notification queue. Message passing enables communication between departments (processes).",
        })


# Global instance
ws_manager = ConnectionManager()
