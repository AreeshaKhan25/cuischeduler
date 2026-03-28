from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date, time


class TimetableEntryBase(BaseModel):
    booking_id: Optional[int] = None
    resource_id: int
    day_of_week: str
    start_time: time
    end_time: time
    week_start_date: Optional[date] = None


class TimetableEntryCreate(TimetableEntryBase):
    pass


class TimetableEntryUpdate(BaseModel):
    resource_id: Optional[int] = None
    day_of_week: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    week_start_date: Optional[date] = None


class TimetableEntryResponse(TimetableEntryBase):
    id: int
    booking_title: Optional[str] = None
    resource_name: Optional[str] = None
    os_concept_note: str = "Timetable entries represent scheduled process execution windows - analogous to real-time OS task scheduling where each task has a fixed time partition on a specific processor."

    class Config:
        from_attributes = True


class WeekTimetableResponse(BaseModel):
    week_start: Optional[date] = None
    entries: List[TimetableEntryResponse]
    os_concept_note: str = "The weekly timetable is the OS schedule: a complete mapping of which process (class/lab) runs on which processor (room) at what time. This implements a static partitioned scheduling scheme."


class AutoScheduleRequest(BaseModel):
    booking_ids: List[int]
    algorithm: str = "fcfs"
    week_start_date: Optional[date] = None
