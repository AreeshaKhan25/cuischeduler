from pydantic import BaseModel
from typing import Optional, List
from datetime import date, time, datetime


class BookingBase(BaseModel):
    title: str
    course_code: Optional[str] = None
    department: str = "Computer Science"
    faculty_id: Optional[int] = None
    resource_id: Optional[int] = None
    resource_type: str = "classroom"
    date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    duration_minutes: int = 60
    priority: int = 5


class BookingCreate(BookingBase):
    requested_by: Optional[int] = None


class BookingUpdate(BaseModel):
    title: Optional[str] = None
    course_code: Optional[str] = None
    department: Optional[str] = None
    faculty_id: Optional[int] = None
    resource_id: Optional[int] = None
    resource_type: Optional[str] = None
    date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    priority: Optional[int] = None
    state: Optional[str] = None


class BookingResponse(BookingBase):
    id: int
    process_id: str
    requested_by: int
    state: str = "new"
    arrival_time: float = 0
    waiting_time: float = 0
    turnaround_time: float = 0
    algorithm_used: Optional[str] = None
    os_concept_note: Optional[str] = "Each booking represents a process in the OS process model. It transitions through states: new -> ready -> running -> completed, mirroring the OS process lifecycle."
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BookingStateTransition(BaseModel):
    state: str
    os_concept_note: Optional[str] = None


class BookingQueueResponse(BaseModel):
    algorithm: str
    queue: List[BookingResponse]
    os_concept_note: str = "The ready queue holds all processes that are loaded in memory and waiting for CPU time. The scheduler selects the next process based on the active scheduling algorithm."
