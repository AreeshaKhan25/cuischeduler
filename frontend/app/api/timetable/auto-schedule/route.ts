import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse, getCurrentUser } from "@/lib/auth-helpers";
import { autoSchedule } from "@/lib/auto-scheduler";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user || user.role !== "admin") return errorResponse("Admin only", 403);

  const body = await request.json().catch(() => ({}));
  let semesterId = body.semesterId;

  // Default to active semester
  if (!semesterId) {
    const active = await prisma.semester.findFirst({ where: { isActive: true } });
    if (!active) return errorResponse("No active semester found");
    semesterId = active.id;
  }

  const clear = body.clear ?? true;
  if (clear) {
    await prisma.timetableEntry.deleteMany({ where: { semesterId } });
  }

  const result = await autoSchedule(prisma, semesterId);

  // Save placements to DB
  if (result.placements.length > 0) {
    await prisma.timetableEntry.createMany({
      data: result.placements.map((p) => ({
        courseOfferingId: p.courseOfferingId,
        resourceId: p.resourceId,
        semesterId,
        dayOfWeek: p.dayOfWeek,
        slotIndex: p.slotIndex,
        startTime: p.startTime,
        endTime: p.endTime,
        isLab: p.isLab,
      })),
    });
  }

  return jsonResponse({
    placed: result.placed,
    failed: result.failed,
    total: result.total,
    failures: result.failures,
    osNote: result.osNote,
  });
}
