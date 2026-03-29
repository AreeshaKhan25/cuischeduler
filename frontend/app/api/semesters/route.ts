import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const semesters = await prisma.semester.findMany({
    orderBy: { id: "desc" },
    include: { _count: { select: { courseOfferings: true, timetableEntries: true } } },
  });
  return jsonResponse(semesters);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { code, name, startDate, endDate, isActive } = body;
  if (!code || !name) return errorResponse("code and name required");

  const semester = await prisma.semester.create({
    data: { code, name, startDate: startDate || "", endDate: endDate || "", isActive: isActive ?? false },
  });
  return jsonResponse(semester, 201);
}
