import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function PATCH(request: NextRequest) {
  const toDept = new URL(request.url).searchParams.get("to_department");
  const where: Record<string, unknown> = { read: false };
  if (toDept) where.toDepartment = toDept;

  const result = await prisma.notification.updateMany({ where, data: { read: true } });
  return jsonResponse({ marked_read: result.count, os_concept_note: `${result.count} messages marked as read.` });
}
