import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";
import { checkConflict } from "@/lib/auto-scheduler";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cr = await prisma.changeRequest.findUnique({ where: { id: parseInt(id) } });
  if (!cr) return errorResponse("Not found", 404);

  if (!cr.requestedResourceId || !cr.requestedDay || cr.requestedSlot === null) {
    return jsonResponse({ hasConflict: false, details: "Incomplete request data" });
  }

  const result = await checkConflict(
    prisma,
    cr.semesterId,
    cr.requestedResourceId,
    cr.requestedDay,
    cr.requestedSlot,
    cr.timetableEntryId || undefined
  );

  return jsonResponse(result);
}
