from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from datetime import datetime, timezone

from database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    from_department = Column(String(100), nullable=True)
    to_department = Column(String(100), nullable=True)
    type = Column(String(50), default="info")
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=True)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    os_concept = Column(String(255), nullable=True)
