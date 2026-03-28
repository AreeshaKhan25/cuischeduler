from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
from models.notification import Notification
from schemas.notification import NotificationCreate, NotificationResponse, NotificationQueueState
from websocket.manager import ws_manager

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[NotificationResponse])
def list_notifications(
    to_department: Optional[str] = None,
    type: Optional[str] = None,
    unread_only: bool = False,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(Notification)
    if to_department:
        query = query.filter(Notification.to_department == to_department)
    if type:
        query = query.filter(Notification.type == type)
    if unread_only:
        query = query.filter(Notification.read == False)

    return query.order_by(desc(Notification.created_at)).limit(limit).all()


@router.get("/queue-state", response_model=NotificationQueueState)
def get_queue_state(db: Session = Depends(get_db)):
    all_notifs = db.query(Notification).order_by(desc(Notification.created_at)).limit(100).all()
    unread = [n for n in all_notifs if not n.read]

    departments = list(set(
        [n.from_department for n in all_notifs if n.from_department] +
        [n.to_department for n in all_notifs if n.to_department]
    ))

    return NotificationQueueState(
        total_messages=len(all_notifs),
        unread_messages=len(unread),
        departments=sorted(departments),
        queue=[NotificationResponse.model_validate(n) for n in all_notifs],
        os_concept_note=(
            f"IPC Message Queue: {len(all_notifs)} total messages, {len(unread)} unread. "
            f"Departments (processes): {', '.join(sorted(departments)) if departments else 'none'}. "
            "This implements the producer-consumer pattern: departments produce messages into a bounded buffer, "
            "and recipient departments consume them. The queue provides asynchronous, decoupled communication."
        ),
    )


@router.post("/", response_model=NotificationResponse)
async def create_notification(notif_data: NotificationCreate, db: Session = Depends(get_db)):
    notification = Notification(
        from_department=notif_data.from_department,
        to_department=notif_data.to_department,
        type=notif_data.type,
        subject=notif_data.subject,
        body=notif_data.body,
        os_concept=notif_data.os_concept or "IPC message passing between department processes.",
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

    await ws_manager.broadcast_notification({
        "id": notification.id,
        "from": notification.from_department,
        "to": notification.to_department,
        "subject": notification.subject,
        "type": notification.type,
    })

    return notification


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.patch("/read-all")
def mark_all_read(
    to_department: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Notification).filter(Notification.read == False)
    if to_department:
        query = query.filter(Notification.to_department == to_department)

    count = query.update({"read": True})
    db.commit()

    return {
        "marked_read": count,
        "os_concept_note": (
            f"Bulk message consumption: {count} messages marked as read. "
            "Like a consumer process draining the message queue - "
            "all pending IPC messages have been acknowledged."
        ),
    }
