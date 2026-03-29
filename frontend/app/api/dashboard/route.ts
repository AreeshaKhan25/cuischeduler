export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET() {
  const [totalResources, classrooms, labs, faculty, totalBookings, activeBookings, readyBookings, completedBookings, blockedBookings, waitingBookings, newBookings, notifications, unreadNotifs] = await Promise.all([
    prisma.resource.count(),
    prisma.resource.count({ where: { type: "classroom" } }),
    prisma.resource.count({ where: { type: "lab" } }),
    prisma.resource.count({ where: { type: "faculty" } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { state: "running" } }),
    prisma.booking.count({ where: { state: "ready" } }),
    prisma.booking.count({ where: { state: "completed" } }),
    prisma.booking.count({ where: { state: "blocked" } }),
    prisma.booking.count({ where: { state: "waiting" } }),
    prisma.booking.count({ where: { state: "new" } }),
    prisma.notification.count(),
    prisma.notification.count({ where: { read: false } }),
  ]);

  const recentBookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" }, take: 10,
    include: { resource: true },
  });

  const readyQueue = await prisma.booking.findMany({
    where: { state: "ready" }, orderBy: { arrivalTime: "asc" }, take: 6,
  });

  const conflicts = blockedBookings;

  return jsonResponse({
    stats: {
      totalResources, classrooms, labs, faculty,
      totalBookings, activeBookings, readyBookings, completedBookings,
      blockedBookings, waitingBookings, newBookings,
      conflicts, notifications, unreadNotifs,
    },
    recentBookings: recentBookings.map(b => ({
      id: b.id, processId: b.processId, title: b.title, state: b.state,
      resourceName: b.resource?.name || "Unassigned",
      startTime: b.startTime, endTime: b.endTime, date: b.date,
      priority: b.priority, algorithmUsed: b.algorithmUsed,
    })),
    readyQueue: readyQueue.map(b => ({
      id: b.id, processId: b.processId, title: b.title,
      durationMinutes: b.durationMinutes, priority: b.priority,
      arrivalTime: b.arrivalTime,
    })),
  });
}
