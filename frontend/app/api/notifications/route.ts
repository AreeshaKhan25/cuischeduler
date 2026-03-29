import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const unreadOnly = searchParams.get("unread_only") === "true";
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (unreadOnly) where.read = false;

  const notifs = await prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, take: limit });
  return jsonResponse(notifs);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const notif = await prisma.notification.create({
    data: {
      userId: body.user_id || null,
      type: body.type || "info",
      subject: body.subject,
      body: body.body,
    },
  });
  return jsonResponse(notif, 201);
}
