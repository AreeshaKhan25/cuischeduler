from sqlalchemy import Column, Integer, String, Time, Date, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class TimetableEntry(Base):
    __tablename__ = "timetable_entries"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    day_of_week = Column(String(20), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    week_start_date = Column(Date, nullable=True)

    booking = relationship("Booking", back_populates="timetable_entry")
    resource = relationship("Resource", back_populates="timetable_entries")
