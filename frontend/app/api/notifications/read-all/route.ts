import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function PATCH() {
  const result = await prisma.notification.updateMany({
    where: { read: false },
    data: { read: true },
  });
  return jsonResponse({ marked_read: result.count });
}
