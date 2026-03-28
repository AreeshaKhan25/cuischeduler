import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const toDept = searchParams.get("to_department");
  const type = searchParams.get("type");
  const unreadOnly = searchParams.get("unread_only") === "true";
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};
  if (toDept) where.toDepartment = toDept;
  if (type) where.type = type;
  if (unreadOnly) where.read = false;

  const notifs = await prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, take: limit });
  return jsonResponse(notifs);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const notif = await prisma.notification.create({
    data: { fromDepartment: body.from_department, toDepartment: body.to_department, type: body.type || "info", subject: body.subject, body: body.body, osConcept: body.os_concept || "IPC message passing between departments." },
  });
  return jsonResponse(notif, 201);
}
