from sqlalchemy import Column, Integer, String, DateTime, Date, Time, Float, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from database import Base


class BookingState(str, enum.Enum):
    new = "new"
    ready = "ready"
    running = "running"
    waiting = "waiting"
    completed = "completed"
    blocked = "blocked"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    process_id = Column(String(20), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    course_code = Column(String(20), nullable=True)
    department = Column(String(100), default="Computer Science")
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=True)
    resource_type = Column(String(50), default="classroom")
    requested_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    duration_minutes = Column(Integer, default=60)
    priority = Column(Integer, default=5)
    state = Column(SAEnum(BookingState), default=BookingState.new)
    arrival_time = Column(Float, default=0)
    waiting_time = Column(Float, default=0)
    turnaround_time = Column(Float, default=0)
    algorithm_used = Column(String(50), nullable=True)
    os_concept_note = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    resource = relationship("Resource", back_populates="bookings")
    requester = relationship("User", back_populates="bookings_requested", foreign_keys=[requested_by])
    faculty = relationship("User", back_populates="bookings_faculty", foreign_keys=[faculty_id])
    timetable_entry = relationship("TimetableEntry", back_populates="booking", uselist=False)
