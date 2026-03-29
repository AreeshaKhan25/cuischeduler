import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse, getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cr = await prisma.changeRequest.findUnique({
    where: { id: parseInt(id) },
    include: {
      requestedBy: { select: { id: true, name: true, email: true, role: true } },
      resolvedBy: { select: { id: true, name: true } },
      semester: true,
      timetableEntry: {
        include: {
          courseOffering: { include: { course: true, section: true, faculty: true } },
          resource: true,
        },
      },
    },
  });
  if (!cr) return errorResponse("Change request not found", 404);
  return jsonResponse(cr);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser(request);
  if (!user || user.role !== "admin") return errorResponse("Admin only", 403);

  const body = await request.json();
  const { status, adminNote } = body;

  if (!status) return errorResponse("status required");

  const cr = await prisma.changeRequest.findUnique({
    where: { id: parseInt(id) },
    include: { timetableEntry: true },
  });
  if (!cr) return errorResponse("Not found", 404);

  // If approving, apply the change to the timetable
  if (status === "approved" && cr.timetableEntryId && cr.timetableEntry) {
    const updateData: Record<string, unknown> = {};
    if (cr.type === "room_change" && cr.requestedResourceId) {
      updateData.resourceId = cr.requestedResourceId;
    }
    if (cr.type === "time_change") {
      if (cr.requestedDay) updateData.dayOfWeek = cr.requestedDay;
      if (cr.requestedSlot !== null) {
        updateData.slotIndex = cr.requestedSlot;
        // Update start/end time based on slot
        const TIME_SLOTS = [
          { start: "08:30", end: "09:25" }, { start: "09:35", end: "10:30" },
          { start: "10:40", end: "11:35" }, { start: "11:45", end: "12:40" },
          { start: "13:20", end: "14:15" }, { start: "14:25", end: "15:20" },
          { start: "15:30", end: "16:25" },
        ];
        const slot = TIME_SLOTS[cr.requestedSlot];
        if (slot) {
          updateData.startTime = slot.start;
          updateData.endTime = slot.end;
        }
      }
    }
    if (cr.type === "swap" && cr.requestedResourceId) {
      updateData.resourceId = cr.requestedResourceId;
      if (cr.requestedDay) updateData.dayOfWeek = cr.requestedDay;
      if (cr.requestedSlot !== null) updateData.slotIndex = cr.requestedSlot;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.timetableEntry.update({
        where: { id: cr.timetableEntryId },
        data: updateData,
      });
    }
  }

  const updated = await prisma.changeRequest.update({
    where: { id: parseInt(id) },
    data: {
      status,
      adminNote: adminNote || null,
      resolvedById: user.id,
      resolvedAt: new Date(),
    },
    include: {
      requestedBy: { select: { id: true, name: true, role: true } },
      timetableEntry: { include: { courseOffering: { include: { course: true, section: true } }, resource: true } },
    },
  });

  return jsonResponse(updated);
}
