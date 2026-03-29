import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";

const STATE_TRANSITIONS: Record<string, string[]> = {
  new: ["ready"],
  ready: ["running", "waiting"],
  running: ["completed", "waiting", "blocked"],
  waiting: ["ready", "blocked"],
  blocked: ["ready", "new"],
  completed: [],
};

export async function PATCH(req: NextRequest, { params }: { params: { bookingId: string } }) {
  const { state: newState } = await req.json();

  // Booking model no longer exists — return mock response for OS demo
  const mockCurrentState = "ready";
  const valid = STATE_TRANSITIONS[mockCurrentState] || [];
  if (!valid.includes(newState)) {
    return errorResponse(`Invalid transition: ${mockCurrentState} → ${newState}. Valid: ${valid.join(", ")}`, 400);
  }

  return jsonResponse({
    id: parseInt(params.bookingId),
    state: newState,
    osConceptNote: `State changed: ${mockCurrentState} → ${newState}`,
    os_concept_note: `Demo: State transition ${mockCurrentState} → ${newState}`,
  });
}
