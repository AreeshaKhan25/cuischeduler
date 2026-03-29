import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse, getCurrentUser } from "@/lib/auth-helpers";
import { checkConflict, suggestAlternatives } from "@/lib/auto-scheduler";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  // Non-admin users only see their own requests
  if (user && user.role !== "admin") {
    where.requestedById = user.id;
  }

  const requests = await prisma.changeRequest.findMany({
    where,
    include: {
      requestedBy: { select: { id: true, name: true, email: true, role: true } },
      resolvedBy: { select: { id: true, name: true } },
      semester: { select: { id: true, code: true } },
      timetableEntry: {
        include: {
          courseOffering: { include: { course: true, section: true, faculty: true } },
          resource: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return jsonResponse(requests);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const {
    semesterId, timetableEntryId, type, currentDay, currentSlot, currentResourceId,
    requestedDay, requestedSlot, requestedResourceId, reason,
  } = body;

  if (!semesterId || !type || !reason) {
    return errorResponse("semesterId, type, and reason are required");
  }

  // Auto-check conflict for the requested slot
  let conflictDetails: string | null = null;
  let suggestedAlts: string | null = null;
  let initialStatus = "pending";

  if (requestedResourceId && requestedDay && requestedSlot !== undefined) {
    const conflict = await checkConflict(prisma, semesterId, requestedResourceId, requestedDay, requestedSlot);
    if (conflict.hasConflict) {
      initialStatus = "conflict";
      const ce = conflict.conflictingEntry;
      conflictDetails = JSON.stringify({
        message: `Room occupied by ${ce.courseOffering.course.name} (${ce.courseOffering.section.name})`,
        conflictingEntryId: ce.id,
        faculty: ce.courseOffering.faculty?.name || "TBD",
      });

      // Get alternatives
      const entry = timetableEntryId
        ? await prisma.timetableEntry.findUnique({
            where: { id: timetableEntryId },
            include: { courseOffering: true },
          })
        : null;

      const alts = await suggestAlternatives(
        prisma,
        semesterId,
        requestedResourceId,
        entry?.courseOffering?.sectionId || 0,
        entry?.courseOffering?.facultyId || null,
        requestedDay
      );
      suggestedAlts = JSON.stringify(alts);
    }
  }

  const cr = await prisma.changeRequest.create({
    data: {
      requestedById: user.id,
      semesterId,
      timetableEntryId: timetableEntryId || null,
      type,
      currentDay: currentDay || null,
      currentSlot: currentSlot ?? null,
      currentResourceId: currentResourceId || null,
      requestedDay: requestedDay || null,
      requestedSlot: requestedSlot ?? null,
      requestedResourceId: requestedResourceId || null,
      reason,
      status: initialStatus,
      conflictDetails,
      suggestedAlternatives: suggestedAlts,
      osConceptTag: "Resource request — analogous to Banker's Algorithm safe-state check (OS Ch.7)",
    },
    include: {
      requestedBy: { select: { id: true, name: true, role: true } },
      timetableEntry: { include: { courseOffering: { include: { course: true, section: true } }, resource: true } },
    },
  });

  return jsonResponse(cr, 201);
}
