from typing import Optional, List
from datetime import date, time, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models.timetable import TimetableEntry
from models.booking import Booking, BookingState
from models.resource import Resource
from schemas.timetable import (
    TimetableEntryCreate, TimetableEntryUpdate, TimetableEntryResponse,
    WeekTimetableResponse, AutoScheduleRequest,
)
from services.scheduling_engine import SchedulingEngine

router = APIRouter(prefix="/timetable", tags=["Timetable"])
engine = SchedulingEngine()


def entry_to_response(entry: TimetableEntry, db: Session) -> dict:
    booking_title = None
    resource_name = None

    if entry.booking_id:
        booking = db.query(Booking).filter(Booking.id == entry.booking_id).first()
        if booking:
            booking_title = booking.title

    if entry.resource_id:
        resource = db.query(Resource).filter(Resource.id == entry.resource_id).first()
        if resource:
            resource_name = resource.name

    return {
        "id": entry.id,
        "booking_id": entry.booking_id,
        "resource_id": entry.resource_id,
        "day_of_week": entry.day_of_week,
        "start_time": entry.start_time,
        "end_time": entry.end_time,
        "week_start_date": entry.week_start_date,
        "booking_title": booking_title,
        "resource_name": resource_name,
        "os_concept_note": "Timetable entry represents a scheduled process execution window - a fixed time partition on a specific processor.",
    }


@router.get("/", response_model=WeekTimetableResponse)
def get_timetable(
    department: Optional[str] = None,
    resource_id: Optional[int] = None,
    week_start: Optional[date] = None,
    db: Session = Depends(get_db),
):
    query = db.query(TimetableEntry)

    if week_start:
        query = query.filter(TimetableEntry.week_start_date == week_start)

    if resource_id:
        query = query.filter(TimetableEntry.resource_id == resource_id)

    entries = query.order_by(TimetableEntry.day_of_week, TimetableEntry.start_time).all()

    # Filter by department if specified (through booking)
    if department:
        filtered = []
        for e in entries:
            if e.booking_id:
                booking = db.query(Booking).filter(Booking.id == e.booking_id).first()
                if booking and booking.department == department:
                    filtered.append(e)
            else:
                filtered.append(e)
        entries = filtered

    entry_responses = [entry_to_response(e, db) for e in entries]

    return WeekTimetableResponse(
        week_start=week_start,
        entries=[TimetableEntryResponse(**er) for er in entry_responses],
    )


@router.post("/", response_model=TimetableEntryResponse)
def create_timetable_entry(entry_data: TimetableEntryCreate, db: Session = Depends(get_db)):
    # Check for conflicts
    conflict = db.query(TimetableEntry).filter(
        TimetableEntry.resource_id == entry_data.resource_id,
        TimetableEntry.day_of_week == entry_data.day_of_week,
        TimetableEntry.start_time < entry_data.end_time,
        TimetableEntry.end_time > entry_data.start_time,
    ).first()

    if conflict:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "Time slot conflict detected",
                "conflicting_entry_id": conflict.id,
                "os_concept_note": "Resource conflict - mutual exclusion prevents two processes from using the same resource simultaneously.",
            },
        )

    entry = TimetableEntry(**entry_data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)

    resp = entry_to_response(entry, db)
    return TimetableEntryResponse(**resp)


@router.put("/{entry_id}", response_model=TimetableEntryResponse)
def update_timetable_entry(entry_id: int, entry_data: TimetableEntryUpdate, db: Session = Depends(get_db)):
    entry = db.query(TimetableEntry).filter(TimetableEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Timetable entry not found")

    update_dict = entry_data.model_dump(exclude_unset=True)

    # Check conflicts with new values
    check_resource = update_dict.get("resource_id", entry.resource_id)
    check_day = update_dict.get("day_of_week", entry.day_of_week)
    check_start = update_dict.get("start_time", entry.start_time)
    check_end = update_dict.get("end_time", entry.end_time)

    conflict = db.query(TimetableEntry).filter(
        TimetableEntry.id != entry_id,
        TimetableEntry.resource_id == check_resource,
        TimetableEntry.day_of_week == check_day,
        TimetableEntry.start_time < check_end,
        TimetableEntry.end_time > check_start,
    ).first()

    if conflict:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "Time slot conflict with existing entry",
                "conflicting_entry_id": conflict.id,
                "os_concept_note": "Rescheduling blocked by mutual exclusion - the target time slot is already allocated.",
            },
        )

    for key, value in update_dict.items():
        setattr(entry, key, value)

    db.commit()
    db.refresh(entry)

    resp = entry_to_response(entry, db)
    return TimetableEntryResponse(**resp)


@router.delete("/{entry_id}")
def delete_timetable_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(TimetableEntry).filter(TimetableEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Timetable entry not found")

    db.delete(entry)
    db.commit()

    return {
        "detail": "Timetable entry deleted",
        "os_concept_note": "Scheduled process removed from the timetable - time slot freed for reallocation.",
    }


@router.post("/auto-schedule")
def auto_schedule(request: AutoScheduleRequest, db: Session = Depends(get_db)):
    bookings = db.query(Booking).filter(Booking.id.in_(request.booking_ids)).all()
    if not bookings:
        raise HTTPException(status_code=404, detail="No bookings found")

    # Get available resources
    resources = db.query(Resource).filter(Resource.status == "available").order_by(Resource.id).all()
    if not resources:
        raise HTTPException(status_code=400, detail="No available resources for scheduling")

    # Build process list for scheduling engine
    requests_data = [
        {
            "id": b.id,
            "process_id": b.process_id,
            "title": b.title,
            "arrival_time": b.arrival_time or 0,
            "duration_minutes": b.duration_minutes or 60,
            "priority": b.priority or 5,
        }
        for b in bookings
    ]

    # Run selected algorithm
    algo = request.algorithm.lower()
    if algo == "fcfs":
        result = engine.run_fcfs(requests_data)
    elif algo == "sjf":
        result = engine.run_sjf(requests_data)
    elif algo == "priority":
        result = engine.run_priority(requests_data)
    else:
        result = engine.run_fcfs(requests_data)

    # Create timetable entries based on scheduling result
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    week_start = request.week_start_date or date.today()
    created_entries = []
    resource_idx = 0
    day_idx = 0
    hour = 8

    for metric in result["metrics"]:
        booking = db.query(Booking).filter(Booking.id == metric["booking_id"]).first()
        if not booking:
            continue

        duration_hours = max(1, (booking.duration_minutes or 60) // 60)
        start_t = time(hour, 0)
        end_hour = min(hour + duration_hours, 18)
        end_t = time(end_hour, 0)

        resource = resources[resource_idx % len(resources)]

        # Check for conflict
        conflict = db.query(TimetableEntry).filter(
            TimetableEntry.resource_id == resource.id,
            TimetableEntry.day_of_week == days[day_idx % 5],
            TimetableEntry.start_time < end_t,
            TimetableEntry.end_time > start_t,
        ).first()

        if conflict:
            hour = end_hour
            if hour >= 17:
                hour = 8
                day_idx += 1
                if day_idx >= 5:
                    resource_idx += 1
                    day_idx = 0

            start_t = time(hour, 0)
            end_hour = min(hour + duration_hours, 18)
            end_t = time(end_hour, 0)

        entry = TimetableEntry(
            booking_id=booking.id,
            resource_id=resource.id,
            day_of_week=days[day_idx % 5],
            start_time=start_t,
            end_time=end_t,
            week_start_date=week_start,
        )
        db.add(entry)

        # Update booking
        booking.resource_id = resource.id
        booking.start_time = start_t
        booking.end_time = end_t
        booking.state = BookingState.ready
        booking.algorithm_used = request.algorithm

        created_entries.append({
            "booking_id": booking.id,
            "process_id": booking.process_id,
            "resource_name": resource.name,
            "day": days[day_idx % 5],
            "time": f"{start_t.strftime('%H:%M')}-{end_t.strftime('%H:%M')}",
        })

        hour = end_hour
        if hour >= 17:
            hour = 8
            day_idx += 1
            if day_idx >= 5:
                resource_idx += 1
                day_idx = 0

    db.commit()

    return {
        "scheduled": len(created_entries),
        "entries": created_entries,
        "algorithm_used": request.algorithm,
        "scheduling_result": result,
        "os_concept_note": (
            f"Auto-scheduled {len(created_entries)} processes using {request.algorithm.upper()} algorithm. "
            "Each process was assigned a processor (room) and time slot based on the algorithm's ordering. "
            "This is analogous to a batch scheduler assigning jobs to CPUs based on the selected scheduling policy."
        ),
    }
