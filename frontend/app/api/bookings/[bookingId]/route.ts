import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";

export async function GET(_req: NextRequest, { params }: { params: { bookingId: string } }) {
  // Booking model removed — return mock for OS demo
  return jsonResponse({
    id: parseInt(params.bookingId),
    processId: `P${params.bookingId}`,
    title: "Demo Booking",
    state: "ready",
    department: "Computer Science",
    durationMinutes: 60,
    priority: 5,
    os_concept_note: "Booking model deprecated — mock data for demo purposes.",
  });
}

export async function PUT(req: NextRequest, { params }: { params: { bookingId: string } }) {
  const body = await req.json();
  return jsonResponse({ id: parseInt(params.bookingId), ...body, os_concept_note: "Mock update — booking model deprecated." });
}

export async function DELETE(_req: NextRequest, { params }: { params: { bookingId: string } }) {
  return jsonResponse({ detail: "Booking deleted (mock)", id: parseInt(params.bookingId) });
}
