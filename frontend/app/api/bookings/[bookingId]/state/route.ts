import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
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
  const booking = await prisma.booking.findUnique({ where: { id: parseInt(params.bookingId) } });
  if (!booking) return errorResponse("Booking not found", 404);

  const valid = STATE_TRANSITIONS[booking.state] || [];
  if (!valid.includes(newState)) {
    return errorResponse(`Invalid transition: ${booking.state} → ${newState}. Valid: ${valid.join(", ")}`, 400);
  }

  const updated = await prisma.booking.update({
    where: { id: parseInt(params.bookingId) },
    data: { state: newState, osConceptNote: `State changed: ${booking.state} → ${newState}` },
  });
  return jsonResponse(updated);
}
