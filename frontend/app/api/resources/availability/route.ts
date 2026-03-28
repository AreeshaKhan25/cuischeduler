import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const building = searchParams.get("building");
  const dateStr = searchParams.get("date");

  const where: Record<string, string> = {};
  if (type) where.type = type;
  if (building) where.building = building;

  const resources = await prisma.resource.findMany({ where });
  const result = [];

  for (const r of resources) {
    const bookingWhere: Record<string, unknown> = {
      resourceId: r.id,
      state: { in: ["running", "ready", "waiting"] },
    };
    if (dateStr) bookingWhere.date = dateStr;

    const bookings = await prisma.booking.findMany({ where: bookingWhere });
    const bookedHours = new Set<number>();
    for (const b of bookings) {
      if (b.startTime && b.endTime) {
        const sh = parseInt(b.startTime.split(":")[0]);
        const eh = parseInt(b.endTime.split(":")[0]);
        for (let h = sh; h < eh; h++) bookedHours.add(h);
      }
    }

    const available_slots = [];
    for (let h = 8; h < 18; h++) {
      if (!bookedHours.has(h)) {
        available_slots.push({ start: `${String(h).padStart(2, "0")}:00`, end: `${String(h + 1).padStart(2, "0")}:00` });
      }
    }

    result.push({ resource_id: r.id, resource_name: r.name, resource_type: r.type, available_slots });
  }

  return jsonResponse(result);
}
