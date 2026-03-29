import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse, getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

/**
 * OS Scenarios API — dynamic OS concept tracking
 * Scenarios are created by:
 * 1. System — when conflicts/deadlocks are detected in resource requests
 * 2. Manual — when users/admin create scenarios for demonstration
 * 3. Simulation — when running OS algorithm simulations
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // deadlock, scheduling, concurrency, memory
  const status = searchParams.get("status"); // active, resolved, archived
  const source = searchParams.get("source"); // manual, system, simulation

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (source) where.source = source;

  const scenarios = await prisma.oSScenario.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Also get live system stats for each type
  const [
    activeDeadlocks,
    pendingRequests,
    totalEntries,
    conflictRequests,
  ] = await Promise.all([
    prisma.oSScenario.count({ where: { type: "deadlock", status: "active" } }),
    prisma.resourceRequest.count({ where: { status: "pending" } }),
    prisma.timetableEntry.count(),
    prisma.resourceRequest.count({ where: { status: "conflict" } }),
  ]);

  return jsonResponse({
    scenarios,
    liveStats: {
      activeDeadlocks,
      pendingRequests,
      totalScheduledClasses: totalEntries,
      conflictRequests,
    },
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const { type, title, description, data, source } = body;

  if (!type || !title) return errorResponse("type and title required");

  const scenario = await prisma.oSScenario.create({
    data: {
      type,
      title,
      description: description || "",
      data: typeof data === "string" ? data : JSON.stringify(data || {}),
      source: source || "manual",
      status: "active",
    },
  });

  return jsonResponse(scenario, 201);
}
