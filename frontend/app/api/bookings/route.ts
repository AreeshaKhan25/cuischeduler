import { NextRequest } from "next/server";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET() {
  // Booking model removed — return empty array
  return jsonResponse([]);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Booking model removed — return mock created booking for OS demo
  const mockBooking = {
    id: 1,
    processId: "P1",
    title: body.title || "Demo Booking",
    courseCode: body.course_code,
    department: body.department || "Computer Science",
    resourceType: body.resource_type || "classroom",
    date: body.date,
    startTime: body.start_time,
    endTime: body.end_time,
    durationMinutes: body.duration_minutes || 60,
    priority: body.priority || 5,
    state: "new",
    arrivalTime: 0,
    osConceptNote: "Process P1 created (new state). Like fork() creating a new process.",
  };

  return jsonResponse(mockBooking, 201);
}
