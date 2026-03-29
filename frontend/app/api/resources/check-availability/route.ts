import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

/**
 * Check if a resource (room/lab) is available at a specific day+slot.
 * Returns availability status, and if occupied, who/what is using it.
 * This is the core "dynamic check" the user requested.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resourceId = searchParams.get("resource_id");
  const day = searchParams.get("day");
  const slotIndex = searchParams.get("slot");
  const semesterId = searchParams.get("semester_id");

  if (!resourceId || !day || slotIndex === null) {
    return errorResponse("resource_id, day, and slot are required");
  }

  // Get active semester if not provided
  let semId: number;
  if (semesterId) {
    semId = parseInt(semesterId);
  } else {
    const active = await prisma.semester.findFirst({ where: { isActive: true } });
    if (!active) return errorResponse("No active semester");
    semId = active.id;
  }

  const slot = parseInt(slotIndex);
  const resId = parseInt(resourceId);

  // Check timetable for this slot
  const existing = await prisma.timetableEntry.findFirst({
    where: {
      resourceId: resId,
      semesterId: semId,
      dayOfWeek: day,
      slotIndex: slot,
    },
    include: {
      courseOffering: {
        include: {
          course: true,
          section: true,
          faculty: { select: { id: true, name: true } },
        },
      },
      resource: true,
    },
  });

  // Also check for lab entries that span this slot (a lab starting at slot-1)
  const labOverlap = await prisma.timetableEntry.findFirst({
    where: {
      resourceId: resId,
      semesterId: semId,
      dayOfWeek: day,
      slotIndex: slot - 1,
      isLab: true,
    },
    include: {
      courseOffering: {
        include: { course: true, section: true, faculty: { select: { id: true, name: true } } },
      },
    },
  });

  // Check pending resource requests for this slot
  const pendingRequests = await prisma.resourceRequest.findMany({
    where: {
      resourceId: resId,
      semesterId: semId,
      dayOfWeek: day,
      slotIndex: slot,
      status: { in: ["pending", "approved"] },
    },
    include: {
      requestedBy: { select: { id: true, name: true, role: true } },
    },
  });

  // Check approved change requests targeting this slot
  const approvedChanges = await prisma.changeRequest.findMany({
    where: {
      semesterId: semId,
      requestedResourceId: resId,
      requestedDay: day,
      requestedSlot: slot,
      status: "approved",
    },
    include: {
      requestedBy: { select: { id: true, name: true } },
    },
  });

  const occupiedBy = existing || labOverlap;
  const isOccupied = !!occupiedBy;
  const hasPendingRequests = pendingRequests.length > 0;

  // Resource info
  const resource = await prisma.resource.findUnique({ where: { id: resId } });

  return jsonResponse({
    available: !isOccupied,
    resource: resource ? { id: resource.id, name: resource.name, type: resource.type, capacity: resource.capacity } : null,
    day,
    slotIndex: slot,
    occupiedBy: occupiedBy
      ? {
          entryId: occupiedBy.id,
          courseName: occupiedBy.courseOffering?.course?.name,
          courseCode: occupiedBy.courseOffering?.course?.code,
          sectionName: occupiedBy.courseOffering?.section?.name,
          facultyName: occupiedBy.courseOffering?.faculty?.name,
          isLab: occupiedBy.isLab,
        }
      : null,
    pendingRequests: pendingRequests.map((r) => ({
      id: r.id,
      requestedBy: r.requestedBy.name,
      reason: r.reason,
      status: r.status,
    })),
    approvedChanges: approvedChanges.length,
    // OS concept: resource contention
    osNote: isOccupied
      ? `Resource contention detected — ${resource?.name} is held by ${occupiedBy?.courseOffering?.section?.name}. This is analogous to a process holding a resource in OS deadlock theory (Ch.7).`
      : hasPendingRequests
      ? `Resource has pending requests — similar to processes in a wait queue (OS Ch.5).`
      : `Resource is free — available for allocation.`,
  });
}
