from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.booking import Booking, BookingState
from models.resource import Resource
from schemas.scheduling import (
    RAGResponse, DeadlockAnalysis, BankersRequest, BankersResult,
    ScenarioRequest, DeadlockResolveRequest,
)
from services.deadlock_detector import DeadlockDetector
from websocket.manager import ws_manager

router = APIRouter(prefix="/deadlock", tags=["Deadlock Detection"])
detector = DeadlockDetector()


@router.get("/rag")
def get_rag(db: Session = Depends(get_db)):
    bookings = db.query(Booking).filter(
        Booking.state.in_([BookingState.running, BookingState.waiting, BookingState.blocked])
    ).all()
    resources = db.query(Resource).all()

    bookings_data = [
        {
            "id": b.id,
            "process_id": b.process_id,
            "title": b.title,
            "resource_id": b.resource_id,
            "state": b.state.value if hasattr(b.state, 'value') else str(b.state),
        }
        for b in bookings
    ]
    resources_data = [
        {"id": r.id, "name": r.name, "type": r.type.value if hasattr(r.type, 'value') else str(r.type)}
        for r in resources
    ]

    rag = detector.build_rag(bookings_data, resources_data)

    # Run cycle detection
    result = detector.detect_cycle_dfs(rag["nodes"], rag["edges"])

    return {
        "nodes": result["nodes"],
        "edges": result["edges"],
        "has_deadlock": result["has_deadlock"],
        "cycle_description": result.get("cycle_description"),
        "os_concept_note": (
            "The Resource Allocation Graph (RAG) visualizes process-resource relationships. "
            "Request edges (process->resource) and assignment edges (resource->process) reveal circular waits - "
            "a necessary condition for deadlock. "
            f"{'DEADLOCK DETECTED: ' + result.get('cycle_description', '') if result['has_deadlock'] else 'No deadlock detected - system is in a safe state.'}"
        ),
    }


@router.post("/analyze")
async def analyze_deadlock(db: Session = Depends(get_db)):
    bookings = db.query(Booking).filter(
        Booking.state.in_([BookingState.running, BookingState.waiting, BookingState.blocked])
    ).all()
    resources = db.query(Resource).all()

    bookings_data = [
        {
            "id": b.id,
            "process_id": b.process_id,
            "title": b.title,
            "resource_id": b.resource_id,
            "state": b.state.value if hasattr(b.state, 'value') else str(b.state),
        }
        for b in bookings
    ]
    resources_data = [
        {"id": r.id, "name": r.name, "type": r.type.value if hasattr(r.type, 'value') else str(r.type)}
        for r in resources
    ]

    rag = detector.build_rag(bookings_data, resources_data)
    result = detector.detect_cycle_dfs(rag["nodes"], rag["edges"])

    resolution_options = []
    if result["has_deadlock"]:
        resolution_options = [
            "terminate_youngest - Kill the most recently created process to break the cycle",
            "preempt_lowest_priority - Preempt resources from the lowest priority process",
            "rollback - Roll back all deadlocked processes to ready state",
        ]

        await ws_manager.broadcast_deadlock_detected({
            "deadlocked_processes": result["deadlocked_processes"],
            "cycle": result["cycle"],
        })

    return {
        "has_deadlock": result["has_deadlock"],
        "deadlocked_processes": result["deadlocked_processes"],
        "deadlocked_resources": result["deadlocked_resources"],
        "cycle": result["cycle"],
        "rag": {
            "nodes": result["nodes"],
            "edges": result["edges"],
            "has_deadlock": result["has_deadlock"],
            "cycle_description": result.get("cycle_description"),
            "os_concept_note": "RAG analysis with DFS cycle detection.",
        },
        "resolution_options": resolution_options,
        "os_concept_note": (
            f"Deadlock analysis complete. "
            f"{'DEADLOCK FOUND: ' + str(len(result['deadlocked_processes'])) + ' processes in circular wait. ' if result['has_deadlock'] else 'No deadlock detected. '}"
            "Deadlock occurs when four conditions hold simultaneously: mutual exclusion, hold and wait, no preemption, and circular wait. "
            "Detection uses DFS-based cycle finding in the Resource Allocation Graph."
        ),
    }


@router.post("/bankers")
def run_bankers(request: BankersRequest):
    processes = [p.get("id", p.get("process_id", f"P{i}")) for i, p in enumerate(request.processes)]
    result = detector.run_bankers(
        processes=processes,
        resources=request.resources,
        max_matrix=request.max_matrix,
        allocation_matrix=request.allocation_matrix,
        available=request.available,
    )
    return result


@router.post("/scenario")
async def create_scenario(request: ScenarioRequest, db: Session = Depends(get_db)):
    result = detector.create_demo_scenario(request.scenario_type, db)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    if request.scenario_type in ("classic", "chain"):
        await ws_manager.broadcast_deadlock_detected({
            "scenario": request.scenario_type,
            "description": result.get("description", ""),
        })

    return result


@router.post("/resolve")
async def resolve_deadlock(request: DeadlockResolveRequest, db: Session = Depends(get_db)):
    # Find deadlocked bookings
    bookings = db.query(Booking).filter(
        Booking.state.in_([BookingState.blocked, BookingState.waiting])
    ).all()

    if not bookings:
        return {
            "resolved": False,
            "message": "No deadlocked processes found",
            "os_concept_note": "No blocked or waiting processes found - no deadlock to resolve.",
        }

    bookings_data = [
        {
            "id": b.id,
            "process_id": b.process_id,
            "title": b.title,
            "resource_id": b.resource_id,
            "priority": b.priority,
            "state": b.state.value if hasattr(b.state, 'value') else str(b.state),
        }
        for b in bookings
    ]

    result = detector.resolve_deadlock(bookings_data, request.strategy, db)

    if result.get("resolved"):
        await ws_manager.broadcast("deadlock_resolved", {
            "strategy": request.strategy,
            "victim": result.get("victim"),
            "os_concept_note": result.get("os_concept_note", ""),
        })

    return result
