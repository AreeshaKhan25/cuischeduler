import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";
import { runFcfs, runSjf, runPriority } from "@/lib/scheduling-engine";

export async function POST(request: NextRequest) {
  const { booking_ids, algorithm, week_start_date } = await request.json();
  const bookings = await prisma.booking.findMany({ where: { id: { in: booking_ids } } });
  if (!bookings.length) return errorResponse("No bookings found", 404);
  const resources = await prisma.resource.findMany({ where: { status: "available" }, orderBy: { id: "asc" } });
  if (!resources.length) return errorResponse("No available resources");

  const data = bookings.map(b => ({ id: b.id, process_id: b.processId, title: b.title, arrival_time: b.arrivalTime, duration_minutes: b.durationMinutes, priority: b.priority }));
  const algo = (algorithm || "fcfs").toLowerCase();
  const result = algo === "sjf" ? runSjf(data) : algo === "priority" ? runPriority(data) : runFcfs(data);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const weekStart = week_start_date || new Date().toISOString().split("T")[0];
  const created = [];
  let resIdx = 0, dayIdx = 0, hour = 8;

  for (const m of result.metrics) {
    const booking = bookings.find(b => b.id === m.booking_id);
    if (!booking) continue;
    const durH = Math.max(1, Math.floor(booking.durationMinutes / 60));
    const endH = Math.min(hour + durH, 18);
    const st = `${String(hour).padStart(2, "0")}:00`;
    const et = `${String(endH).padStart(2, "0")}:00`;
    const res = resources[resIdx % resources.length];

    await prisma.timetableEntry.create({ data: { bookingId: booking.id, resourceId: res.id, dayOfWeek: days[dayIdx % 5], startTime: st, endTime: et, weekStartDate: weekStart } });
    await prisma.booking.update({ where: { id: booking.id }, data: { resourceId: res.id, startTime: st, endTime: et, state: "ready", algorithmUsed: algorithm } });

    created.push({ booking_id: booking.id, process_id: booking.processId, resource_name: res.name, day: days[dayIdx % 5], time: `${st}-${et}` });
    hour = endH;
    if (hour >= 17) { hour = 8; dayIdx++; if (dayIdx >= 5) { resIdx++; dayIdx = 0; } }
  }

  return jsonResponse({ scheduled: created.length, entries: created, algorithm_used: algorithm, scheduling_result: result, os_concept_note: `Auto-scheduled ${created.length} processes using ${algorithm}.` });
}
