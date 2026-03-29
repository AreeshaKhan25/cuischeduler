export const dynamic = "force-dynamic";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET() {
  // Mock ready queue for OS concepts demo
  const mockQueue = [
    { id: 1, processId: "P1", title: "Statistics and Probability", state: "ready", arrivalTime: 0, durationMinutes: 60, priority: 5 },
    { id: 2, processId: "P2", title: "Design and Analysis of Algo", state: "ready", arrivalTime: 5, durationMinutes: 60, priority: 2 },
    { id: 3, processId: "P3", title: "Web Technologies", state: "ready", arrivalTime: 10, durationMinutes: 60, priority: 4 },
    { id: 4, processId: "P4", title: "COAL Lab", state: "ready", arrivalTime: 15, durationMinutes: 120, priority: 4 },
    { id: 5, processId: "P5", title: "Machine Learning Funda.", state: "ready", arrivalTime: 20, durationMinutes: 60, priority: 2 },
  ];

  const notes: Record<string, string> = {
    fcfs: "Ready queue sorted by arrival time (FIFO).",
    sjf: "Ready queue sorted by burst time (shortest first).",
    priority: "Ready queue sorted by priority (lower = higher priority).",
    round_robin: "Ready queue in arrival order. Each process gets a fixed time quantum.",
  };

  return jsonResponse({ algorithm: "fcfs", queue: mockQueue, os_concept_note: notes["fcfs"] });
}
