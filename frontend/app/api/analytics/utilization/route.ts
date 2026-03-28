import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const resType = new URL(request.url).searchParams.get("resource_type");
  const where = resType ? { type: resType } : {};
  const resources = await prisma.resource.findMany({ where });

  const data = [];
  let totalSlots = 0, totalBooked = 0;

  for (const r of resources) {
    const bookings = await prisma.booking.findMany({ where: { resourceId: r.id, state: { in: ["completed", "running", "ready"] } } });
    const bookedH = bookings.reduce((s, b) => s + (b.durationMinutes || 60) / 60, 0);
    const util = Math.min((bookedH / 50) * 100, 100);
    data.push({ resource_id: r.id, resource_name: r.name, resource_type: r.type, total_slots: 50, booked_slots: Math.round(bookedH), utilization_percent: Math.round(util * 100) / 100 });
    totalSlots += 50; totalBooked += bookedH;
  }

  return jsonResponse({ data, overall_utilization: totalSlots > 0 ? Math.round(totalBooked / totalSlots * 10000) / 100 : 0, os_concept_note: "Resource utilization across the campus." });
}
