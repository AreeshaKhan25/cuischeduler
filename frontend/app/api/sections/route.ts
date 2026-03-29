import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const program = searchParams.get("program");
  const department = searchParams.get("department");

  const where: Record<string, unknown> = {};
  if (program) where.program = program;
  if (department) where.department = department;

  const sections = await prisma.section.findMany({
    where,
    orderBy: [{ program: "asc" }, { semester: "asc" }, { name: "asc" }],
    include: { _count: { select: { courseOfferings: true } } },
  });
  return jsonResponse(sections);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, program, semester, strength, department } = body;
  if (!name || !program) return errorResponse("name and program required");

  const section = await prisma.section.create({
    data: { name, program, semester: semester ?? 1, strength: strength ?? 50, department: department ?? "Computer Science" },
  });
  return jsonResponse(section, 201);
}
