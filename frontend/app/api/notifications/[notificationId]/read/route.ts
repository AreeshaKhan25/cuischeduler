import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";

export async function PATCH(_req: NextRequest, { params }: { params: { notificationId: string } }) {
  const notif = await prisma.notification.findUnique({ where: { id: parseInt(params.notificationId) } });
  if (!notif) return errorResponse("Notification not found", 404);
  const updated = await prisma.notification.update({ where: { id: notif.id }, data: { read: true } });
  return jsonResponse(updated);
}
