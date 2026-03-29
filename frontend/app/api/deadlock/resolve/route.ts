import { NextRequest } from "next/server";
import { jsonResponse } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  const { strategy } = await request.json();

  // Booking model removed — return mock resolution for OS demo
  if (strategy === "terminate_youngest") {
    return jsonResponse({ resolved: true, strategy, victim: "P3", action: "Process terminated and resources released.", os_concept_note: "Youngest process terminated to break circular wait." });
  }
  if (strategy === "preempt_lowest_priority") {
    return jsonResponse({ resolved: true, strategy, victim: "P2", action: "Resources preempted.", os_concept_note: "Lowest priority process loses its resources." });
  }
  if (strategy === "rollback") {
    return jsonResponse({ resolved: true, strategy, victim: "all_deadlocked", action: "All rolled back to ready.", os_concept_note: "All deadlocked processes rolled back." });
  }

  return jsonResponse({ resolved: false, error: `Unknown strategy: ${strategy}` });
}
