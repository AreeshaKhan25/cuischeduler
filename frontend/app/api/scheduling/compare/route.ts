import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";
import { compareAll } from "@/lib/scheduling-engine";

export async function POST(request: NextRequest) {
  const { booking_ids, quantum } = await request.json();
  const bookings = await prisma.booking.findMany({ where: { id: { in: booking_ids } } });
  if (!bookings.length) return errorResponse("No bookings found", 404);

  const data = bookings.map(b => ({ id: b.id, process_id: b.processId, title: b.title, arrival_time: b.arrivalTime, duration_minutes: b.durationMinutes, priority: b.priority }));
  return jsonResponse(compareAll(data, quantum || 30));
}
