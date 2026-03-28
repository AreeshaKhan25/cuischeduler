import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import (
    auth_router,
    resources_router,
    bookings_router,
    scheduling_router,
    deadlock_router,
    timetable_router,
    analytics_router,
    notifications_router,
)
from websocket.manager import ws_manager

app = FastAPI(
    title="CUIScheduler API",
    description="COMSATS University Resource Scheduling System - OS Concepts Demonstration",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        os.getenv("FRONTEND_URL", ""),
        # Allow all Vercel preview deployments
        "https://cuischeduler.vercel.app",
        "https://cuischeduler-areeshakhan25.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers under /api prefix
app.include_router(auth_router, prefix="/api")
app.include_router(resources_router, prefix="/api")
app.include_router(bookings_router, prefix="/api")
app.include_router(scheduling_router, prefix="/api")
app.include_router(deadlock_router, prefix="/api")
app.include_router(timetable_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")


@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back with acknowledgment
            await ws_manager.send_personal(
                {"event": "ack", "data": data, "os_concept_note": "WebSocket provides full-duplex IPC - like a Unix pipe enabling bidirectional communication between processes."},
                websocket,
            )
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


@app.get("/")
def root():
    return {
        "name": "CUIScheduler API",
        "version": "1.0.0",
        "description": "University Resource Scheduling System demonstrating OS concepts",
        "os_concept_note": "This API server is the OS kernel - managing resources, scheduling processes (bookings), handling IPC (notifications), and detecting deadlocks.",
        "endpoints": {
            "auth": "/api/auth",
            "resources": "/api/resources",
            "bookings": "/api/bookings",
            "scheduling": "/api/scheduling",
            "deadlock": "/api/deadlock",
            "timetable": "/api/timetable",
            "analytics": "/api/analytics",
            "notifications": "/api/notifications",
            "websocket": "/ws",
            "docs": "/docs",
        },
    }


@app.get("/health")
def health():
    return {"status": "healthy", "os_concept_note": "Health check - like an OS watchdog timer ensuring the system is responsive."}
