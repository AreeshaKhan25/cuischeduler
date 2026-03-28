import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";

export async function GET(_req: NextRequest, { params }: { params: { resourceId: string } }) {
  const resource = await prisma.resource.findUnique({ where: { id: parseInt(params.resourceId) } });
  if (!resource) return errorResponse("Resource not found", 404);
  return jsonResponse({ ...resource, features: JSON.parse(resource.features || "{}") });
}

export async function PUT(req: NextRequest, { params }: { params: { resourceId: string } }) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.type) data.type = body.type;
  if (body.building) data.building = body.building;
  if (body.floor !== undefined) data.floor = body.floor;
  if (body.capacity) data.capacity = body.capacity;
  if (body.status) data.status = body.status;
  if (body.department) data.department = body.department;
  if (body.features) data.features = JSON.stringify(body.features);

  const resource = await prisma.resource.update({ where: { id: parseInt(params.resourceId) }, data });
  return jsonResponse({ ...resource, features: JSON.parse(resource.features || "{}") });
}

export async function DELETE(_req: NextRequest, { params }: { params: { resourceId: string } }) {
  await prisma.resource.delete({ where: { id: parseInt(params.resourceId) } });
  return jsonResponse({ detail: "Resource deleted" });
}
