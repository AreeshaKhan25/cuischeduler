import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";
import { runFcfs, runSjf, runRoundRobin, runPriority } from "@/lib/scheduling-engine";

export async function POST(request: NextRequest) {
  const { algorithm, booking_ids, quantum } = await request.json();
  const bookings = await prisma.booking.findMany({ where: { id: { in: booking_ids } } });
  if (!bookings.length) return errorResponse("No bookings found", 404);

  const data = bookings.map(b => ({ id: b.id, process_id: b.processId, title: b.title, arrival_time: b.arrivalTime, duration_minutes: b.durationMinutes, priority: b.priority }));
  const algo = (algorithm || "fcfs").toLowerCase();
  let result;
  if (algo === "fcfs") result = runFcfs(data);
  else if (algo === "sjf") result = runSjf(data);
  else if (algo === "round_robin") result = runRoundRobin(data, quantum || 30);
  else if (algo === "priority") result = runPriority(data);
  else return errorResponse(`Unknown algorithm: ${algo}`);

  for (const m of result.metrics) {
    await prisma.booking.update({ where: { id: m.booking_id }, data: { waitingTime: m.waiting_time, turnaroundTime: m.turnaround_time, algorithmUsed: algorithm, state: "completed" } });
  }

  return jsonResponse(result);
}
