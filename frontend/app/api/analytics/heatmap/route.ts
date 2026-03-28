import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const resType = new URL(request.url).searchParams.get("resource_type");
  const where: Record<string, unknown> = { state: { in: ["completed", "running", "ready"] } };
  if (resType) where.resourceType = resType;

  const bookings = await prisma.booking.findMany({ where });
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const hours = Array.from({ length: 16 }, (_, i) => i + 8);
  const matrix = Array.from({ length: 7 }, () => new Array(16).fill(0));

  for (const b of bookings) {
    if (b.date && b.startTime) {
      const d = new Date(b.date);
      const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
      if (dayIdx < 7) {
        const sh = parseInt(b.startTime.split(":")[0]);
        const eh = b.endTime ? parseInt(b.endTime.split(":")[0]) : sh + 1;
        for (let h = sh; h < Math.min(eh, 24); h++) { const hi = h - 8; if (hi >= 0 && hi < 16) matrix[dayIdx][hi]++; }
      }
    }
  }

  const maxVal = Math.max(...matrix.flat(), 1);
  const norm = matrix.map(row => row.map(c => Math.round((c / maxVal) * 1000) / 1000));

  return jsonResponse({ matrix: norm, days, hours, os_concept_note: "Heatmap showing temporal resource demand patterns." });
}
