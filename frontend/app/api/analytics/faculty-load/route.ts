export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET() {
  const faculty = await prisma.user.findMany({ where: { role: "faculty" } });
  const data = [];
  for (const f of faculty) {
    const bookings = await prisma.booking.findMany({ where: { facultyId: f.id } });
    const totalH = bookings.reduce((s, b) => s + (b.durationMinutes || 60) / 60, 0);
    data.push({ faculty_id: f.id, faculty_name: f.name, total_hours: Math.round(totalH * 10) / 10, booking_count: bookings.length, department: f.department });
  }
  data.sort((a, b) => b.total_hours - a.total_hours);
  return jsonResponse({ data, os_concept_note: "Faculty load distribution - analogous to CPU load balancing." });
}
