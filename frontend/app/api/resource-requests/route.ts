import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse, getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (user && user.role !== "admin") where.requestedById = user.id;

  const requests = await prisma.resourceRequest.findMany({
    where,
    include: {
      requestedBy: { select: { id: true, name: true, role: true, department: true } },
      resolvedBy: { select: { id: true, name: true } },
      resource: { select: { id: true, name: true, type: true } },
      semester: { select: { id: true, code: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return jsonResponse(requests);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const { resourceId, dayOfWeek, slotIndex, reason } = body;

  if (!resourceId || !dayOfWeek || slotIndex === undefined || !reason) {
    return errorResponse("resourceId, dayOfWeek, slotIndex, and reason are required");
  }

  // Get active semester
  const semester = await prisma.semester.findFirst({ where: { isActive: true } });
  if (!semester) return errorResponse("No active semester");

  // Check if resource exists
  const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
  if (!resource) return errorResponse("Resource not found", 404);

  // Check current occupancy
  const existingEntry = await prisma.timetableEntry.findFirst({
    where: {
      resourceId,
      semesterId: semester.id,
      dayOfWeek,
      slotIndex,
    },
    include: {
      courseOffering: {
        include: { course: true, section: true, faculty: { select: { name: true } } },
      },
    },
  });

  // Check lab overlap
  const labOverlap = await prisma.timetableEntry.findFirst({
    where: {
      resourceId,
      semesterId: semester.id,
      dayOfWeek,
      slotIndex: slotIndex - 1,
      isLab: true,
    },
    include: {
      courseOffering: {
        include: { course: true, section: true, faculty: { select: { name: true } } },
      },
    },
  });

  const isOccupied = !!existingEntry || !!labOverlap;
  const conflictEntry = existingEntry || labOverlap;

  // Check if there's already a pending request for this exact slot by someone else
  const existingRequest = await prisma.resourceRequest.findFirst({
    where: {
      resourceId,
      semesterId: semester.id,
      dayOfWeek,
      slotIndex,
      status: { in: ["pending", "approved"] },
      requestedById: { not: user.id },
    },
  });

  // Determine if this creates a deadlock scenario:
  // Deadlock = resource is occupied AND user still insists (sends to admin)
  const isDeadlock = isOccupied;
  let deadlockDetails: string | null = null;

  if (isDeadlock && conflictEntry) {
    deadlockDetails = JSON.stringify({
      type: "resource_contention",
      holdingProcess: conflictEntry.courseOffering?.section?.name || "Unknown",
      holdingCourse: conflictEntry.courseOffering?.course?.name || "Unknown",
      requestingUser: user.name,
      resource: resource.name,
      day: dayOfWeek,
      slot: slotIndex,
      description: `${user.name} requests ${resource.name} on ${dayOfWeek} slot ${slotIndex + 1}, but it is held by ${conflictEntry.courseOffering?.section?.name} for ${conflictEntry.courseOffering?.course?.name}`,
    });
  }

  // Create the resource request
  const rr = await prisma.resourceRequest.create({
    data: {
      requestedById: user.id,
      resourceId,
      semesterId: semester.id,
      dayOfWeek,
      slotIndex,
      reason,
      status: isOccupied ? "conflict" : "pending",
      conflictWith: conflictEntry?.id || null,
      isDeadlock,
      deadlockDetails,
    },
    include: {
      requestedBy: { select: { id: true, name: true } },
      resource: { select: { id: true, name: true, type: true } },
    },
  });

  // If deadlock, auto-create an OS scenario
  if (isDeadlock) {
    await prisma.oSScenario.create({
      data: {
        type: "deadlock",
        title: `Resource Contention: ${resource.name}`,
        description: `${user.name} requests ${resource.name} on ${dayOfWeek} Slot ${slotIndex + 1}, but it is occupied by ${conflictEntry?.courseOffering?.section?.name || "another class"}. Admin must resolve this deadlock.`,
        data: deadlockDetails || "{}",
        source: "system",
        sourceId: rr.id,
        status: "active",
      },
    });
  }

  // Create notification for admin
  await prisma.notification.create({
    data: {
      type: isOccupied ? "request_update" : "info",
      subject: isOccupied
        ? `⚠️ Conflict: ${user.name} requests occupied ${resource.name}`
        : `📋 Request: ${user.name} requests ${resource.name}`,
      body: `${user.name} wants ${resource.name} on ${dayOfWeek} Slot ${slotIndex + 1}. ${
        isOccupied ? "CONFLICT: Resource is currently occupied. This is a deadlock scenario." : "Resource is available."
      } Reason: ${reason}`,
      read: false,
    },
  });

  return jsonResponse({
    ...rr,
    isOccupied,
    conflictDetails: isOccupied
      ? {
          occupiedBy: conflictEntry?.courseOffering?.section?.name,
          course: conflictEntry?.courseOffering?.course?.name,
          faculty: conflictEntry?.courseOffering?.faculty?.name,
        }
      : null,
    osNote: isOccupied
      ? "DEADLOCK DETECTED: Resource held by another process. Admin must resolve using deadlock resolution strategies (preemption, rollback, or process termination — OS Ch.7)."
      : "Resource available. Request queued for admin approval.",
  }, 201);
}
