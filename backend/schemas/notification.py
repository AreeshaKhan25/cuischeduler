from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class NotificationBase(BaseModel):
    from_department: Optional[str] = None
    to_department: Optional[str] = None
    type: str = "info"
    subject: str
    body: Optional[str] = None
    os_concept: Optional[str] = None


class NotificationCreate(NotificationBase):
    pass


class NotificationResponse(NotificationBase):
    id: int
    read: bool = False
    created_at: Optional[datetime] = None
    os_concept_note: str = "Notifications implement inter-process communication (IPC) using a message-passing model. Each message has a sender, receiver, and payload - like OS message queues between cooperating processes."

    class Config:
        from_attributes = True


class NotificationQueueState(BaseModel):
    total_messages: int
    unread_messages: int
    departments: List[str]
    queue: List[NotificationResponse]
    os_concept_note: str = "The notification queue implements a bounded-buffer IPC mechanism. Producers (senders) enqueue messages; consumers (receivers) dequeue them. This mirrors the producer-consumer problem in OS concurrency."
