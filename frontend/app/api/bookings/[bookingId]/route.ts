import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";

export async function GET(_req: NextRequest, { params }: { params: { bookingId: string } }) {
  const booking = await prisma.booking.findUnique({ where: { id: parseInt(params.bookingId) } });
  if (!booking) return errorResponse("Booking not found", 404);
  return jsonResponse(booking);
}

export async function PUT(req: NextRequest, { params }: { params: { bookingId: string } }) {
  const body = await req.json();
  const booking = await prisma.booking.update({ where: { id: parseInt(params.bookingId) }, data: body });
  return jsonResponse(booking);
}

export async function DELETE(_req: NextRequest, { params }: { params: { bookingId: string } }) {
  await prisma.booking.delete({ where: { id: parseInt(params.bookingId) } });
  return jsonResponse({ detail: "Booking deleted" });
}
