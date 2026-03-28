import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const building = searchParams.get("building");
  const department = searchParams.get("department");
  const status = searchParams.get("status");

  const where: Record<string, string> = {};
  if (type) where.type = type;
  if (building) where.building = building;
  if (department) where.department = department;
  if (status) where.status = status;

  const resources = await prisma.resource.findMany({ where });
  return jsonResponse(resources.map(r => ({ ...r, features: JSON.parse(r.features || "{}") })));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const resource = await prisma.resource.create({
    data: {
      name: body.name,
      type: body.type || "classroom",
      building: body.building || "Academic Block",
      floor: body.floor || 0,
      capacity: body.capacity || 40,
      features: JSON.stringify(body.features || {}),
      department: body.department || "Computer Science",
    },
  });
  return jsonResponse({ ...resource, features: JSON.parse(resource.features || "{}") }, 201);
}
