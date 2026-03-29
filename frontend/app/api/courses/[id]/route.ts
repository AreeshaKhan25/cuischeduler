import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id: parseInt(id) }, include: { offerings: { include: { section: true, faculty: true } } } });
  if (!course) return errorResponse("Course not found", 404);
  return jsonResponse(course);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const course = await prisma.course.update({ where: { id: parseInt(id) }, data: body });
  return jsonResponse(course);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.course.delete({ where: { id: parseInt(id) } });
  return jsonResponse({ deleted: true });
}
