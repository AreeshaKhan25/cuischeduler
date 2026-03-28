import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");
  const department = searchParams.get("department");
  const resourceType = searchParams.get("resource_type");
  const date = searchParams.get("date");

  const where: Record<string, unknown> = {};
  if (state) where.state = state;
  if (department) where.department = department;
  if (resourceType) where.resourceType = resourceType;
  if (date) where.date = date;

  const bookings = await prisma.booking.findMany({ where, orderBy: { id: "asc" } });
  return jsonResponse(bookings);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const count = await prisma.booking.count();
  const processId = `P${count + 1}`;

  const booking = await prisma.booking.create({
    data: {
      processId,
      title: body.title,
      courseCode: body.course_code,
      department: body.department || "Computer Science",
      facultyId: body.faculty_id,
      resourceId: body.resource_id,
      resourceType: body.resource_type || "classroom",
      requestedBy: body.requested_by || 1,
      date: body.date,
      startTime: body.start_time,
      endTime: body.end_time,
      durationMinutes: body.duration_minutes || 60,
      priority: body.priority || 5,
      state: "new",
      arrivalTime: count * 5,
      osConceptNote: `Process ${processId} created (new state). Like fork() creating a new process.`,
    },
  });

  return jsonResponse(booking, 201);
}
