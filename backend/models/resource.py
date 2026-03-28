from sqlalchemy import Column, Integer, String, Enum as SAEnum, JSON
from sqlalchemy.orm import relationship
import enum

from database import Base


class ResourceType(str, enum.Enum):
    classroom = "classroom"
    lab = "lab"
    faculty = "faculty"
    exam_slot = "exam_slot"


class ResourceStatus(str, enum.Enum):
    available = "available"
    occupied = "occupied"
    maintenance = "maintenance"


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(SAEnum(ResourceType), nullable=False)
    building = Column(String(100), default="Main Building")
    floor = Column(Integer, default=1)
    capacity = Column(Integer, default=40)
    status = Column(SAEnum(ResourceStatus), default=ResourceStatus.available)
    features = Column(JSON, default=dict)
    department = Column(String(100), default="Computer Science")

    bookings = relationship("Booking", back_populates="resource")
    timetable_entries = relationship("TimetableEntry", back_populates="resource")
