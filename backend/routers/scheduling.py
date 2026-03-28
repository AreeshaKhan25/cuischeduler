from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.booking import Booking, BookingState
from schemas.scheduling import SchedulingRequest
from services.scheduling_engine import SchedulingEngine
from websocket.manager import ws_manager

router = APIRouter(prefix="/scheduling", tags=["Scheduling"])
engine = SchedulingEngine()

CURRENT_ALGORITHM = "fcfs"


@router.post("/run")
async def run_scheduling(request: SchedulingRequest, db: Session = Depends(get_db)):
    global CURRENT_ALGORITHM
    CURRENT_ALGORITHM = request.algorithm

    bookings = db.query(Booking).filter(Booking.id.in_(request.booking_ids)).all()
    if not bookings:
        raise HTTPException(status_code=404, detail="No bookings found for given IDs")

    requests_data = []
    for b in bookings:
        requests_data.append({
            "id": b.id,
            "process_id": b.process_id,
            "title": b.title,
            "arrival_time": b.arrival_time or 0,
            "duration_minutes": b.duration_minutes or 60,
            "priority": b.priority or 5,
        })

    algo = request.algorithm.lower()
    if algo == "fcfs":
        result = engine.run_fcfs(requests_data)
    elif algo == "sjf":
        result = engine.run_sjf(requests_data)
    elif algo == "round_robin":
        result = engine.run_round_robin(requests_data, request.quantum or 30)
    elif algo == "priority":
        result = engine.run_priority(requests_data)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown algorithm: {algo}")

    # Update bookings with computed metrics
    for metric in result["metrics"]:
        booking = db.query(Booking).filter(Booking.id == metric["booking_id"]).first()
        if booking:
            booking.waiting_time = metric["waiting_time"]
            booking.turnaround_time = metric["turnaround_time"]
            booking.algorithm_used = request.algorithm
            booking.state = BookingState.completed
            booking.os_concept_note = (
                f"Scheduled by {request.algorithm.upper()}: "
                f"waiting={metric['waiting_time']}min, turnaround={metric['turnaround_time']}min. "
                f"Completion time={metric['completion_time']}min."
            )

    db.commit()

    await ws_manager.broadcast_scheduling_complete({
        "algorithm": request.algorithm,
        "booking_count": len(bookings),
        "avg_waiting_time": result["avg_waiting_time"],
    })

    return result


@router.post("/compare")
async def compare_algorithms(request: SchedulingRequest, db: Session = Depends(get_db)):
    bookings = db.query(Booking).filter(Booking.id.in_(request.booking_ids)).all()
    if not bookings:
        raise HTTPException(status_code=404, detail="No bookings found for given IDs")

    requests_data = []
    for b in bookings:
        requests_data.append({
            "id": b.id,
            "process_id": b.process_id,
            "title": b.title,
            "arrival_time": b.arrival_time or 0,
            "duration_minutes": b.duration_minutes or 60,
            "priority": b.priority or 5,
        })

    result = engine.compare_all(requests_data, request.quantum or 30)
    return result


@router.get("/metrics")
def get_scheduling_metrics(db: Session = Depends(get_db)):
    completed = db.query(Booking).filter(Booking.state == BookingState.completed).all()

    if not completed:
        return {
            "total_completed": 0,
            "algorithms_used": {},
            "overall_avg_waiting": 0,
            "overall_avg_turnaround": 0,
            "os_concept_note": "No completed processes yet. Run a scheduling algorithm to generate metrics.",
        }

    algo_groups = {}
    total_waiting = 0
    total_turnaround = 0

    for b in completed:
        algo = b.algorithm_used or "unscheduled"
        if algo not in algo_groups:
            algo_groups[algo] = {"count": 0, "total_waiting": 0, "total_turnaround": 0}
        algo_groups[algo]["count"] += 1
        algo_groups[algo]["total_waiting"] += b.waiting_time or 0
        algo_groups[algo]["total_turnaround"] += b.turnaround_time or 0
        total_waiting += b.waiting_time or 0
        total_turnaround += b.turnaround_time or 0

    n = len(completed)
    algo_stats = {}
    for algo, stats in algo_groups.items():
        c = stats["count"]
        algo_stats[algo] = {
            "count": c,
            "avg_waiting_time": round(stats["total_waiting"] / c, 2) if c > 0 else 0,
            "avg_turnaround_time": round(stats["total_turnaround"] / c, 2) if c > 0 else 0,
        }

    return {
        "total_completed": n,
        "algorithms_used": algo_stats,
        "overall_avg_waiting": round(total_waiting / n, 2),
        "overall_avg_turnaround": round(total_turnaround / n, 2),
        "os_concept_note": (
            f"Historical scheduling metrics: {n} processes completed. "
            f"Avg waiting time: {total_waiting / n:.1f}min, avg turnaround: {total_turnaround / n:.1f}min. "
            "These metrics help evaluate scheduler performance over time, similar to OS kernel profiling data."
        ),
    }


@router.get("/current-algorithm")
def get_current_algorithm():
    return {
        "algorithm": CURRENT_ALGORITHM,
        "os_concept_note": f"Current scheduling algorithm: {CURRENT_ALGORITHM.upper()}. The OS scheduler policy determines how the CPU is allocated among competing processes.",
    }
