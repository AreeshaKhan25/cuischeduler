import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sectionId = searchParams.get("section_id");
  const facultyId = searchParams.get("faculty_id");
  const resourceId = searchParams.get("resource_id");
  const semesterId = searchParams.get("semester_id");

  // Default to active semester
  let semId: number | undefined;
  if (semesterId) {
    semId = parseInt(semesterId);
  } else {
    const active = await prisma.semester.findFirst({ where: { isActive: true } });
    semId = active?.id;
  }

  if (!semId) return jsonResponse({ entries: [], semester: null });

  const where: Record<string, unknown> = { semesterId: semId };

  if (sectionId) {
    where.courseOffering = { sectionId: parseInt(sectionId) };
  }
  if (facultyId) {
    where.courseOffering = { ...((where.courseOffering as object) || {}), facultyId: parseInt(facultyId) };
  }
  if (resourceId) {
    where.resourceId = parseInt(resourceId);
  }

  const entries = await prisma.timetableEntry.findMany({
    where,
    include: {
      courseOffering: {
        include: {
          course: true,
          section: true,
          faculty: { select: { id: true, name: true } },
        },
      },
      resource: { select: { id: true, name: true, type: true, building: true } },
    },
    orderBy: [{ dayOfWeek: "asc" }, { slotIndex: "asc" }],
  });

  const semester = await prisma.semester.findUnique({ where: { id: semId } });

  return jsonResponse({ entries, semester });
}
