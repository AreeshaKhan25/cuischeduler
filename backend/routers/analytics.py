from typing import Optional
from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.booking import Booking, BookingState
from models.resource import Resource
from models.user import User, UserRole

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/utilization")
def get_utilization(
    resource_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Resource)
    if resource_type:
        query = query.filter(Resource.type == resource_type)
    resources = query.all()

    data = []
    total_slots = 0
    total_booked = 0

    for r in resources:
        # Each resource has 10 hours per day (8am-6pm), 5 days = 50 slots
        resource_total_slots = 50
        booked_count = db.query(Booking).filter(
            Booking.resource_id == r.id,
            Booking.state.in_([BookingState.completed, BookingState.running, BookingState.ready]),
        ).count()

        # Each booking occupies approximately duration/60 slots
        bookings = db.query(Booking).filter(
            Booking.resource_id == r.id,
            Booking.state.in_([BookingState.completed, BookingState.running, BookingState.ready]),
        ).all()

        booked_hours = sum((b.duration_minutes or 60) / 60 for b in bookings)
        utilization = min((booked_hours / resource_total_slots * 100), 100) if resource_total_slots > 0 else 0

        data.append({
            "resource_id": r.id,
            "resource_name": r.name,
            "resource_type": r.type.value if hasattr(r.type, 'value') else str(r.type),
            "total_slots": resource_total_slots,
            "booked_slots": int(booked_hours),
            "utilization_percent": round(utilization, 2),
            "os_concept_note": (
                f"{r.name}: {utilization:.1f}% utilized. "
                "Resource utilization measures how effectively the OS allocates device time."
            ),
        })

        total_slots += resource_total_slots
        total_booked += booked_hours

    overall = round((total_booked / total_slots * 100), 2) if total_slots > 0 else 0

    return {
        "data": data,
        "overall_utilization": overall,
        "os_concept_note": (
            f"System-wide resource utilization: {overall}%. "
            "Like CPU utilization in an OS - high utilization means the scheduler keeps resources busy. "
            "The goal is to maximize utilization while maintaining acceptable response times."
        ),
    }


@router.get("/algorithms")
def get_algorithm_comparison(db: Session = Depends(get_db)):
    completed = db.query(Booking).filter(
        Booking.state == BookingState.completed,
        Booking.algorithm_used.isnot(None),
    ).all()

    algo_data = {}
    for b in completed:
        algo = b.algorithm_used
        if algo not in algo_data:
            algo_data[algo] = {"waiting": [], "turnaround": [], "count": 0}
        algo_data[algo]["waiting"].append(b.waiting_time or 0)
        algo_data[algo]["turnaround"].append(b.turnaround_time or 0)
        algo_data[algo]["count"] += 1

    algorithms = []
    for algo, stats in algo_data.items():
        n = stats["count"]
        avg_w = sum(stats["waiting"]) / n if n > 0 else 0
        avg_t = sum(stats["turnaround"]) / n if n > 0 else 0

        algo_notes = {
            "fcfs": "FCFS: Simple FIFO ordering. Works well for uniform burst times but susceptible to convoy effect.",
            "sjf": "SJF: Optimal for minimizing average waiting time. Requires burst time estimation.",
            "round_robin": "Round Robin: Fair time-sharing. Good response time but has context switch overhead.",
            "priority": "Priority: Serves critical tasks first. Aging prevents starvation.",
        }

        algorithms.append({
            "algorithm": algo,
            "avg_waiting_time": round(avg_w, 2),
            "avg_turnaround_time": round(avg_t, 2),
            "throughput": round(n / max(sum(stats["turnaround"]), 1), 4),
            "total_runs": n,
            "os_concept_note": algo_notes.get(algo, f"Algorithm: {algo}"),
        })

    return {
        "algorithms": algorithms,
        "os_concept_note": (
            "Algorithm comparison mirrors OS benchmarking: each algorithm excels under different workloads. "
            "FCFS for uniform bursts, SJF for minimizing wait, RR for fairness, Priority for mixed criticality."
        ),
    }


@router.get("/heatmap")
def get_heatmap(
    resource_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    hours = list(range(8, 24))  # 8am to 11pm = 16 hours

    # Initialize 7x16 matrix
    matrix = [[0.0 for _ in range(len(hours))] for _ in range(len(days))]

    query = db.query(Booking).filter(
        Booking.state.in_([BookingState.completed, BookingState.running, BookingState.ready])
    )
    if resource_type:
        query = query.filter(Booking.resource_type == resource_type)

    bookings = query.all()

    for b in bookings:
        if b.date and b.start_time:
            day_idx = b.date.weekday()  # 0=Monday
            if day_idx < 7:
                start_h = b.start_time.hour
                end_h = (b.end_time.hour if b.end_time else start_h + 1)
                for h in range(start_h, min(end_h, 24)):
                    h_idx = h - 8
                    if 0 <= h_idx < len(hours):
                        matrix[day_idx][h_idx] += 1.0

    # Normalize to 0-1 range
    max_val = max(max(row) for row in matrix) if any(any(r > 0 for r in row) for row in matrix) else 1
    if max_val > 0:
        matrix = [[round(cell / max_val, 3) for cell in row] for row in matrix]

    return {
        "matrix": matrix,
        "days": days,
        "hours": hours,
        "os_concept_note": (
            "The heatmap visualizes temporal resource demand patterns. "
            "Like an OS profiler showing CPU usage over time - bright cells indicate peak load periods. "
            "This helps identify when the system is under-provisioned (potential thrashing) or idle."
        ),
    }


@router.get("/faculty-load")
def get_faculty_load(db: Session = Depends(get_db)):
    faculty_users = db.query(User).filter(User.role == UserRole.faculty).all()

    data = []
    for f in faculty_users:
        bookings = db.query(Booking).filter(Booking.faculty_id == f.id).all()
        total_hours = sum((b.duration_minutes or 60) / 60 for b in bookings)

        data.append({
            "faculty_id": f.id,
            "faculty_name": f.name,
            "total_hours": round(total_hours, 1),
            "booking_count": len(bookings),
            "department": f.department or "Computer Science",
        })

    data.sort(key=lambda x: x["total_hours"], reverse=True)

    return {
        "data": data,
        "os_concept_note": (
            "Faculty load distribution is analogous to process load balancing across multiple CPUs. "
            "Uneven distribution means some processors are overloaded while others idle - "
            "a load balancer would migrate processes to achieve equilibrium."
        ),
    }


@router.get("/fragmentation")
def get_fragmentation(
    db: Session = Depends(get_db),
):
    from services.memory_manager import MemoryManager
    mgr = MemoryManager()

    resources = db.query(Resource).all()
    bookings = db.query(Booking).filter(
        Booking.state.in_([BookingState.running, BookingState.waiting, BookingState.blocked])
    ).all()

    res_list = [
        {"id": r.id, "name": r.name, "type": r.type.value if hasattr(r.type, 'value') else str(r.type),
         "capacity": r.capacity}
        for r in resources
    ]
    book_list = [
        {"id": b.id, "process_id": b.process_id, "resource_id": b.resource_id,
         "state": b.state.value if hasattr(b.state, 'value') else str(b.state)}
        for b in bookings
    ]

    pool_state = mgr.get_pool_state(res_list, book_list)

    frag_data = []
    for pool in pool_state["pools"]:
        frag_data.append({
            "resource_type": pool["resource_type"],
            "total_slots": pool["total"],
            "used_slots": pool["allocated"],
            "free_slots": pool["free"],
            "fragments": pool["fragments"],
            "largest_free_block": pool["largest_free_block"],
            "fragmentation_ratio": pool["fragmentation_ratio"],
        })

    return {
        "data": frag_data,
        "overall_fragmentation": pool_state["overall_fragmentation"],
        "os_concept_note": (
            "External fragmentation analysis across resource pools. "
            f"Overall fragmentation: {pool_state['overall_fragmentation']:.1%}. "
            "High fragmentation means free resources are scattered in small non-contiguous blocks, "
            "reducing the ability to allocate large contiguous time slots. "
            "Compaction (defragmentation) consolidates free blocks to improve usability."
        ),
    }
