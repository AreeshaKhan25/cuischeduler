from typing import Optional, List
from datetime import date, time

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models.resource import Resource, ResourceType, ResourceStatus
from models.booking import Booking, BookingState
from schemas.resource import ResourceCreate, ResourceUpdate, ResourceResponse, ResourceAvailability, ResourcePoolState
from services.memory_manager import MemoryManager
from websocket.manager import ws_manager

router = APIRouter(prefix="/resources", tags=["Resources"])
memory_mgr = MemoryManager()


@router.get("/", response_model=List[ResourceResponse])
def list_resources(
    type: Optional[str] = None,
    building: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Resource)
    if type:
        query = query.filter(Resource.type == type)
    if building:
        query = query.filter(Resource.building == building)
    if department:
        query = query.filter(Resource.department == department)
    if status:
        query = query.filter(Resource.status == status)
    return query.all()


@router.get("/pool-state")
def get_pool_state(db: Session = Depends(get_db)):
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

    return memory_mgr.get_pool_state(res_list, book_list)


@router.get("/availability", response_model=List[ResourceAvailability])
def get_availability(
    date: Optional[date] = None,
    type: Optional[str] = None,
    building: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Resource)
    if type:
        query = query.filter(Resource.type == type)
    if building:
        query = query.filter(Resource.building == building)

    resources = query.all()
    result = []

    for r in resources:
        booking_query = db.query(Booking).filter(
            Booking.resource_id == r.id,
            Booking.state.in_([BookingState.running, BookingState.ready, BookingState.waiting]),
        )
        if date:
            booking_query = booking_query.filter(Booking.date == date)

        booked_times = booking_query.all()
        booked_set = set()
        for b in booked_times:
            if b.start_time and b.end_time:
                h = b.start_time.hour
                while h < b.end_time.hour:
                    booked_set.add(h)
                    h += 1

        available_slots = []
        for hour in range(8, 18):
            if hour not in booked_set:
                available_slots.append({
                    "start": f"{hour:02d}:00",
                    "end": f"{hour+1:02d}:00",
                })

        result.append(ResourceAvailability(
            resource_id=r.id,
            resource_name=r.name,
            resource_type=r.type.value if hasattr(r.type, 'value') else str(r.type),
            available_slots=available_slots,
        ))

    return result


@router.get("/{resource_id}", response_model=ResourceResponse)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource


@router.get("/{resource_id}/schedule")
def get_resource_schedule(resource_id: int, db: Session = Depends(get_db)):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    bookings = (
        db.query(Booking)
        .filter(Booking.resource_id == resource_id)
        .filter(Booking.state.in_([BookingState.running, BookingState.ready, BookingState.completed]))
        .order_by(Booking.date, Booking.start_time)
        .all()
    )

    schedule = []
    for b in bookings:
        schedule.append({
            "booking_id": b.id,
            "process_id": b.process_id,
            "title": b.title,
            "date": str(b.date) if b.date else None,
            "start_time": str(b.start_time) if b.start_time else None,
            "end_time": str(b.end_time) if b.end_time else None,
            "state": b.state.value if hasattr(b.state, 'value') else str(b.state),
            "course_code": b.course_code,
        })

    return {
        "resource_id": resource_id,
        "resource_name": resource.name,
        "schedule": schedule,
        "os_concept_note": "Resource schedule shows all processes assigned to this device/processor. Like viewing a CPU's run queue - showing past, current, and future process assignments.",
    }


@router.post("/", response_model=ResourceResponse)
async def create_resource(resource: ResourceCreate, db: Session = Depends(get_db)):
    db_resource = Resource(**resource.model_dump())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)

    await ws_manager.broadcast_resource_updated({
        "id": db_resource.id,
        "name": db_resource.name,
        "action": "created",
    })

    return db_resource


@router.put("/{resource_id}", response_model=ResourceResponse)
async def update_resource(resource_id: int, resource: ResourceUpdate, db: Session = Depends(get_db)):
    db_resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    update_data = resource.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_resource, key, value)

    db.commit()
    db.refresh(db_resource)

    await ws_manager.broadcast_resource_updated({
        "id": db_resource.id,
        "name": db_resource.name,
        "action": "updated",
    })

    return db_resource


@router.delete("/{resource_id}")
async def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    db_resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    db.delete(db_resource)
    db.commit()

    await ws_manager.broadcast_resource_updated({
        "id": resource_id,
        "action": "deleted",
    })

    return {"detail": "Resource deleted", "os_concept_note": "Resource deallocated from the system - like removing a device from the OS device table."}
