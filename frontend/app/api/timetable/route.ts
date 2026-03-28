import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resourceId = searchParams.get("resource_id");
  const weekStart = searchParams.get("week_start");
  const department = searchParams.get("department");

  const where: Record<string, unknown> = {};
  if (resourceId) where.resourceId = parseInt(resourceId);
  if (weekStart) where.weekStartDate = weekStart;

  let entries = await prisma.timetableEntry.findMany({ where, include: { booking: true, resource: true }, orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] });

  if (department) {
    entries = entries.filter(e => !e.booking || e.booking.department === department);
  }

  const mapped = entries.map(e => ({
    id: e.id, booking_id: e.bookingId, resource_id: e.resourceId, day_of_week: e.dayOfWeek,
    start_time: e.startTime, end_time: e.endTime, week_start_date: e.weekStartDate,
    booking_title: e.booking?.title || null, resource_name: e.resource?.name || null,
    os_concept_note: "Timetable entry represents a scheduled process execution window.",
  }));

  return jsonResponse({ week_start: weekStart, entries: mapped });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const conflict = await prisma.timetableEntry.findFirst({
    where: { resourceId: body.resource_id, dayOfWeek: body.day_of_week, startTime: { lt: body.end_time }, endTime: { gt: body.start_time } },
  });
  if (conflict) return errorResponse("Time slot conflict detected", 409);

  const entry = await prisma.timetableEntry.create({
    data: { bookingId: body.booking_id, resourceId: body.resource_id, dayOfWeek: body.day_of_week, startTime: body.start_time, endTime: body.end_time, weekStartDate: body.week_start_date },
    include: { booking: true, resource: true },
  });

  return jsonResponse({ id: entry.id, booking_id: entry.bookingId, resource_id: entry.resourceId, day_of_week: entry.dayOfWeek, start_time: entry.startTime, end_time: entry.endTime, week_start_date: entry.weekStartDate, booking_title: entry.booking?.title, resource_name: entry.resource?.name }, 201);
}
