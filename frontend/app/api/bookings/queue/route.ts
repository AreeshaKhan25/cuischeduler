import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const algo = new URL(request.url).searchParams.get("algorithm") || "fcfs";
  let bookings = await prisma.booking.findMany({ where: { state: "ready" } });

  if (algo === "fcfs") bookings.sort((a, b) => a.arrivalTime - b.arrivalTime || a.id - b.id);
  else if (algo === "sjf") bookings.sort((a, b) => a.durationMinutes - b.durationMinutes || a.arrivalTime - b.arrivalTime);
  else if (algo === "priority") bookings.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
  else bookings.sort((a, b) => a.arrivalTime - b.arrivalTime || a.id - b.id);

  const notes: Record<string, string> = {
    fcfs: "Ready queue sorted by arrival time (FIFO).",
    sjf: "Ready queue sorted by burst time (shortest first).",
    priority: "Ready queue sorted by priority (lower = higher priority).",
    round_robin: "Ready queue in arrival order. Each process gets a fixed time quantum.",
  };

  return jsonResponse({ algorithm: algo, queue: bookings, os_concept_note: notes[algo] || "Ready queue." });
}
