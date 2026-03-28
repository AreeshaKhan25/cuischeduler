from .auth import router as auth_router
from .resources import router as resources_router
from .bookings import router as bookings_router
from .scheduling import router as scheduling_router
from .deadlock import router as deadlock_router
from .timetable import router as timetable_router
from .analytics import router as analytics_router
from .notifications import router as notifications_router

__all__ = [
    "auth_router",
    "resources_router",
    "bookings_router",
    "scheduling_router",
    "deadlock_router",
    "timetable_router",
    "analytics_router",
    "notifications_router",
]
