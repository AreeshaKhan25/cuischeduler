from typing import Optional, List
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.booking import Booking, BookingState
from models.resource import Resource
from schemas.booking import BookingCreate, BookingUpdate, BookingResponse, BookingStateTransition, BookingQueueResponse
from websocket.manager import ws_manager

router = APIRouter(prefix="/bookings", tags=["Bookings"])

STATE_TRANSITIONS = {
    "new": ["ready"],
    "ready": ["running", "waiting"],
    "running": ["completed", "waiting", "blocked"],
    "waiting": ["ready", "blocked"],
    "blocked": ["ready", "new"],
    "completed": [],
}

STATE_NOTES = {
    ("new", "ready"): "Process admitted to ready queue - like a new process being loaded into memory and placed in the ready queue by the long-term scheduler.",
    ("ready", "running"): "Process dispatched to CPU - the short-term scheduler selected this process from the ready queue for execution.",
    ("running", "completed"): "Process terminated normally - execution complete, resources released back to the system.",
    ("running", "waiting"): "Process moved to waiting state - blocked on I/O or waiting for a resource (like a process issuing a disk read).",
    ("running", "blocked"): "Process blocked - cannot proceed due to resource contention or deadlock condition.",
    ("waiting", "ready"): "I/O or event complete - process moves back to ready queue, waiting for CPU dispatch.",
    ("waiting", "blocked"): "Process escalated to blocked - resource permanently unavailable or deadlock detected.",
    ("blocked", "ready"): "Deadlock resolved or resource freed - process can re-enter ready queue.",
    ("blocked", "new"): "Process rolled back to initial state - all resources released, must restart.",
}


def get_next_process_id(db: Session) -> str:
    max_id = db.query(func.max(Booking.id)).scalar()
    next_num = (max_id or 0) + 1
    return f"P{next_num}"


@router.get("/", response_model=List[BookingResponse])
def list_bookings(
    state: Optional[str] = None,
    department: Optional[str] = None,
    resource_type: Optional[str] = None,
    date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Booking)
    if state:
        query = query.filter(Booking.state == state)
    if department:
        query = query.filter(Booking.department == department)
    if resource_type:
        query = query.filter(Booking.resource_type == resource_type)
    if date:
        query = query.filter(Booking.date == date)
    return query.order_by(Booking.id).all()


@router.get("/queue", response_model=BookingQueueResponse)
def get_ready_queue(
    algorithm: str = Query("fcfs", description="Sorting algorithm: fcfs, sjf, priority, round_robin"),
    db: Session = Depends(get_db),
):
    bookings = db.query(Booking).filter(Booking.state == BookingState.ready).all()

    if algorithm == "fcfs":
        bookings.sort(key=lambda b: (b.arrival_time, b.id))
    elif algorithm == "sjf":
        bookings.sort(key=lambda b: (b.duration_minutes, b.arrival_time))
    elif algorithm == "priority":
        bookings.sort(key=lambda b: (b.priority, b.arrival_time))
    elif algorithm == "round_robin":
        bookings.sort(key=lambda b: (b.arrival_time, b.id))

    algo_notes = {
        "fcfs": "Ready queue sorted by arrival time (FIFO). FCFS is the simplest scheduling - first process to arrive gets CPU first.",
        "sjf": "Ready queue sorted by burst time (shortest first). SJF minimizes average waiting time but requires burst prediction.",
        "priority": "Ready queue sorted by priority (lower number = higher priority). Critical bookings are served first.",
        "round_robin": "Ready queue in arrival order. Each process will get a fixed time quantum before being preempted.",
    }

    return BookingQueueResponse(
        algorithm=algorithm,
        queue=[BookingResponse.model_validate(b) for b in bookings],
        os_concept_note=algo_notes.get(algorithm, "Ready queue contains all processes waiting for CPU dispatch."),
    )


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.post("/", response_model=BookingResponse)
async def create_booking(booking_data: BookingCreate, db: Session = Depends(get_db)):
    process_id = get_next_process_id(db)

    booking = Booking(
        process_id=process_id,
        title=booking_data.title,
        course_code=booking_data.course_code,
        department=booking_data.department,
        faculty_id=booking_data.faculty_id,
        resource_id=booking_data.resource_id,
        resource_type=booking_data.resource_type,
        requested_by=booking_data.requested_by or 1,
        date=booking_data.date,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
        duration_minutes=booking_data.duration_minutes,
        priority=booking_data.priority,
        state=BookingState.new,
        arrival_time=0,
        os_concept_note=f"Process {process_id} created (new state). Like fork() creating a new process - it exists but hasn't been admitted to the ready queue yet.",
    )

    # Auto-calculate arrival_time based on existing bookings
    existing_count = db.query(Booking).count()
    booking.arrival_time = existing_count * 5.0

    db.add(booking)
    db.commit()
    db.refresh(booking)

    await ws_manager.broadcast_booking_created({
        "id": booking.id,
        "process_id": booking.process_id,
        "title": booking.title,
        "state": "new",
    })

    return booking


@router.put("/{booking_id}", response_model=BookingResponse)
async def update_booking(booking_id: int, booking_data: BookingUpdate, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    update_dict = booking_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(booking, key, value)

    db.commit()
    db.refresh(booking)
    return booking


@router.patch("/{booking_id}/state", response_model=BookingResponse)
async def transition_state(booking_id: int, transition: BookingStateTransition, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    current_state = booking.state.value if hasattr(booking.state, 'value') else str(booking.state)
    new_state = transition.state

    valid_transitions = STATE_TRANSITIONS.get(current_state, [])
    if new_state not in valid_transitions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid state transition: {current_state} -> {new_state}. Valid transitions: {valid_transitions}",
        )

    old_state = current_state
    booking.state = new_state
    booking.os_concept_note = (
        transition.os_concept_note
        or STATE_NOTES.get((old_state, new_state), f"Process state changed: {old_state} -> {new_state}.")
    )

    db.commit()
    db.refresh(booking)

    await ws_manager.broadcast_booking_state_changed(
        {"id": booking.id, "process_id": booking.process_id, "title": booking.title},
        old_state,
        new_state,
    )

    return booking


@router.delete("/{booking_id}")
async def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    db.delete(booking)
    db.commit()

    return {
        "detail": "Booking deleted",
        "os_concept_note": "Process terminated and removed from the process table. All allocated resources are freed.",
    }
