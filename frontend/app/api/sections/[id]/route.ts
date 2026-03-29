import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const section = await prisma.section.findUnique({
    where: { id: parseInt(id) },
    include: {
      courseOfferings: {
        include: { course: true, faculty: true, _count: { select: { timetableEntries: true } } },
      },
    },
  });
  if (!section) return errorResponse("Section not found", 404);
  return jsonResponse(section);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const section = await prisma.section.update({ where: { id: parseInt(id) }, data: body });
  return jsonResponse(section);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.section.delete({ where: { id: parseInt(id) } });
  return jsonResponse({ deleted: true });
}
