import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offerings = await prisma.courseOffering.findMany({
    where: { sectionId: parseInt(id) },
    include: { course: true, faculty: true, semester: true },
    orderBy: { course: { code: "asc" } },
  });
  return jsonResponse(offerings);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { semesterId, courseId, facultyId, classesPerWeek, labsPerWeek } = body;

  if (!semesterId || !courseId) return errorResponse("semesterId and courseId required");

  const offering = await prisma.courseOffering.create({
    data: {
      semesterId,
      courseId,
      sectionId: parseInt(id),
      facultyId: facultyId || null,
      classesPerWeek: classesPerWeek ?? 2,
      labsPerWeek: labsPerWeek ?? 0,
    },
    include: { course: true, faculty: true },
  });
  return jsonResponse(offering, 201);
}
