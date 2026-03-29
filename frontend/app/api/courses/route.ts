import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department");
  const isLab = searchParams.get("is_lab");

  const where: Record<string, unknown> = {};
  if (department) where.department = department;
  if (isLab !== null && isLab !== undefined) where.isLab = isLab === "true";

  const courses = await prisma.course.findMany({ where, orderBy: { code: "asc" } });
  return jsonResponse(courses);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code, name, creditHours, isLab, isTechnical, department } = body;
  if (!code || !name) return errorResponse("code and name required");

  const course = await prisma.course.create({
    data: { code, name, creditHours: creditHours ?? 3, isLab: isLab ?? false, isTechnical: isTechnical ?? true, department: department ?? "Computer Science" },
  });
  return jsonResponse(course, 201);
}
