import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  const { scenario_type } = await request.json();

  // Booking model removed — return mock scenarios for OS demo
  if (scenario_type === "classic") {
    return jsonResponse({
      scenario: "classic",
      description: "Classic deadlock created with 2 processes.",
      booking_ids: [1, 2, 3, 4],
      processes: [
        { process_id: "P1", title: "Deadlock Demo: holds Lab-1", resource: "Lab-1", state: "running" },
        { process_id: "P2", title: "Deadlock Demo: requests Lab-1", resource: "Lab-1", state: "waiting" },
        { process_id: "P3", title: "Deadlock Demo: holds Room 503", resource: "Room 503", state: "running" },
        { process_id: "P4", title: "Deadlock Demo: requests Room 503", resource: "Room 503", state: "waiting" },
      ],
      os_concept_note: "Deadlock scenario demonstrating circular wait condition.",
    });
  }

  if (scenario_type === "chain") {
    return jsonResponse({
      scenario: "chain",
      description: "Chain deadlock created with 3 processes.",
      booking_ids: [1, 2, 3, 4, 5, 6],
      processes: [
        { process_id: "P1", title: "Chain Demo: holds R1", resource: "Lab-1", state: "running" },
        { process_id: "P2", title: "Chain Demo: holds R2, wants R1", resource: "Lab-2", state: "blocked" },
        { process_id: "P3", title: "Chain Demo: holds R3, wants R2", resource: "Room 503", state: "blocked" },
      ],
      os_concept_note: "Deadlock scenario demonstrating circular wait condition.",
    });
  }

  if (scenario_type === "safe") {
    return jsonResponse({
      scenario: "safe",
      description: "Safe state - no deadlock.",
      booking_ids: [1, 2, 3],
      processes: [
        { process_id: "P1", title: "Safe State Demo: Process 1", resource: "Lab-1", state: "ready" },
        { process_id: "P2", title: "Safe State Demo: Process 2", resource: "Lab-2", state: "ready" },
        { process_id: "P3", title: "Safe State Demo: Process 3", resource: "Room 503", state: "ready" },
      ],
      os_concept_note: "A safe state means all processes can complete.",
    });
  }

  return errorResponse(`Unknown scenario: ${scenario_type}`);
}
