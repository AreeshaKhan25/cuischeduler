import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";
import { runFcfs, runSjf, runRoundRobin, runPriority } from "@/lib/scheduling-engine";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { algorithm, booking_ids, processes, quantum } = body;

  let data: { id: number; process_id: string; title: string; arrival_time: number; duration_minutes: number; priority: number }[];

  if (processes && Array.isArray(processes) && processes.length > 0) {
    // Frontend sends processes directly (from useScheduler hook)
    data = processes.map((p: Record<string, unknown>, i: number) => ({
      id: (p.id as number) || i + 1,
      process_id: (p.process_id as string) || `P${i + 1}`,
      title: (p.title as string) || `Process ${i + 1}`,
      arrival_time: (p.arrival_time as number) || 0,
      duration_minutes: (p.burst_time as number) || (p.duration_minutes as number) || 60,
      priority: (p.priority as number) || 5,
    }));
  } else if (booking_ids && Array.isArray(booking_ids)) {
    // Fetch from DB by IDs
    const bookings = await prisma.booking.findMany({ where: { id: { in: booking_ids } } });
    if (!bookings.length) return errorResponse("No bookings found", 404);
    data = bookings.map(b => ({ id: b.id, process_id: b.processId, title: b.title, arrival_time: b.arrivalTime, duration_minutes: b.durationMinutes, priority: b.priority }));
  } else {
    return errorResponse("Provide either 'processes' array or 'booking_ids' array");
  }

  const algoMap: Record<string, string> = { fcfs: "fcfs", sjf: "sjf", rr: "round_robin", round_robin: "round_robin", priority: "priority" };
  const algo = algoMap[(algorithm || "fcfs").toLowerCase()] || "fcfs";

  let result;
  if (algo === "fcfs") result = runFcfs(data);
  else if (algo === "sjf") result = runSjf(data);
  else if (algo === "round_robin") result = runRoundRobin(data, quantum || 30);
  else result = runPriority(data);

  // Update DB if booking IDs exist
  if (booking_ids) {
    for (const m of result.metrics) {
      try {
        await prisma.booking.update({ where: { id: m.booking_id }, data: { waitingTime: m.waiting_time, turnaroundTime: m.turnaround_time, algorithmUsed: algorithm, state: "completed" } });
      } catch { /* booking may not exist in DB if using processes directly */ }
    }
  }

  return jsonResponse(result);
}
