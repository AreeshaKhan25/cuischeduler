import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";
import { suggestAlternatives } from "@/lib/auto-scheduler";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cr = await prisma.changeRequest.findUnique({
    where: { id: parseInt(id) },
    include: { timetableEntry: { include: { courseOffering: true } } },
  });
  if (!cr) return errorResponse("Not found", 404);

  const resourceId = cr.requestedResourceId || cr.currentResourceId;
  if (!resourceId) return jsonResponse([]);

  const sectionId = cr.timetableEntry?.courseOffering?.sectionId || 0;
  const facultyId = cr.timetableEntry?.courseOffering?.facultyId || null;

  const alternatives = await suggestAlternatives(
    prisma,
    cr.semesterId,
    resourceId,
    sectionId,
    facultyId,
    cr.requestedDay || undefined
  );

  return jsonResponse(alternatives);
}
