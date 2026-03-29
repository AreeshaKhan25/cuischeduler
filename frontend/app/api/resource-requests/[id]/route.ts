import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse, getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rr = await prisma.resourceRequest.findUnique({
    where: { id: parseInt(id) },
    include: {
      requestedBy: { select: { id: true, name: true, role: true, department: true } },
      resolvedBy: { select: { id: true, name: true } },
      resource: true,
      semester: true,
    },
  });
  if (!rr) return errorResponse("Not found", 404);
  return jsonResponse(rr);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser(request);
  if (!user || user.role !== "admin") return errorResponse("Admin only", 403);

  const body = await request.json();
  const { status, adminNote } = body;

  if (!status) return errorResponse("status required");

  const rr = await prisma.resourceRequest.findUnique({
    where: { id: parseInt(id) },
    include: { resource: true, requestedBy: true },
  });
  if (!rr) return errorResponse("Not found", 404);

  // If approving a conflicting request, this is a deadlock resolution
  // Admin is choosing to preempt the existing allocation
  if (status === "approved" && rr.isDeadlock && rr.conflictWith) {
    // Remove the conflicting timetable entry (preemption)
    await prisma.timetableEntry.delete({ where: { id: rr.conflictWith } }).catch(() => {});

    // Mark related OS scenario as resolved
    await prisma.oSScenario.updateMany({
      where: { sourceId: rr.id, type: "deadlock", status: "active" },
      data: {
        status: "resolved",
        resolution: `Admin ${user.name} resolved by preemption: removed existing allocation and granted to ${rr.requestedBy.name}`,
        resolvedAt: new Date(),
      },
    });
  }

  if (status === "rejected" && rr.isDeadlock) {
    // Mark OS scenario as resolved by denying the request
    await prisma.oSScenario.updateMany({
      where: { sourceId: rr.id, type: "deadlock", status: "active" },
      data: {
        status: "resolved",
        resolution: `Admin ${user.name} resolved by denying request: existing allocation maintained`,
        resolvedAt: new Date(),
      },
    });
  }

  const updated = await prisma.resourceRequest.update({
    where: { id: parseInt(id) },
    data: {
      status,
      adminNote: adminNote || null,
      resolvedById: user.id,
      resolvedAt: new Date(),
    },
    include: {
      requestedBy: { select: { id: true, name: true } },
      resource: { select: { id: true, name: true } },
    },
  });

  // Notify the requester
  await prisma.notification.create({
    data: {
      userId: rr.requestedById,
      type: "request_update",
      subject: `Resource request ${status}: ${rr.resource.name}`,
      body: `Your request for ${rr.resource.name} on ${rr.dayOfWeek} Slot ${rr.slotIndex + 1} has been ${status}. ${adminNote || ""}`,
      read: false,
    },
  });

  return jsonResponse(updated);
}
