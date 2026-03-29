export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET() {
  const all = await prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  const unread = all.filter(n => !n.read);

  return jsonResponse({
    total_messages: all.length,
    unread_messages: unread.length,
    queue: all,
    os_concept_note: `IPC Message Queue: ${all.length} total, ${unread.length} unread.`,
  });
}
