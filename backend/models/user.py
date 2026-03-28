from sqlalchemy import Column, Integer, String, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    faculty = "faculty"
    student = "student"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.student, nullable=False)
    department = Column(String(100), default="Computer Science")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    bookings_requested = relationship("Booking", back_populates="requester", foreign_keys="Booking.requested_by")
    bookings_faculty = relationship("Booking", back_populates="faculty", foreign_keys="Booking.faculty_id")
