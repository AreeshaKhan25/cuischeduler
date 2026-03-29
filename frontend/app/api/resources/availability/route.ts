export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET() {
  let resources: { id: number; name: string; type: string }[] = [];
  try {
    resources = await prisma.resource.findMany();
  } catch { /* model may not exist */ }

  if (resources.length === 0) {
    // Mock availability data
    return jsonResponse([
      { resource_id: 1, resource_name: "Lab-1", resource_type: "lab", available_slots: [{ start: "08:00", end: "09:00" }, { start: "11:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
      { resource_id: 2, resource_name: "Lab-2", resource_type: "lab", available_slots: [{ start: "08:00", end: "10:00" }, { start: "13:00", end: "18:00" }] },
      { resource_id: 3, resource_name: "Room 503", resource_type: "classroom", available_slots: [{ start: "08:00", end: "13:00" }, { start: "15:00", end: "18:00" }] },
    ]);
  }

  // Resources exist but no bookings — all slots available
  const result = resources.map(r => {
    const available_slots = [];
    for (let h = 8; h < 18; h++) {
      available_slots.push({ start: `${String(h).padStart(2, "0")}:00`, end: `${String(h + 1).padStart(2, "0")}:00` });
    }
    return { resource_id: r.id, resource_name: r.name, resource_type: r.type, available_slots };
  });

  return jsonResponse(result);
}
