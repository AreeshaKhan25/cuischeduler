import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  const { resource_id } = await req.json();
  const resource = resource_id
    ? await prisma.resource.findUnique({ where: { id: resource_id } })
    : await prisma.resource.findFirst({ where: { type: "lab" } });

  const resourceName = resource?.name || "Lab-1";

  // WITHOUT synchronization — race condition occurs
  const withoutSync = [
    { time: 0, p1: `read(${resourceName}.status)`, p2: "—", shared: "available", issue: "" },
    { time: 1, p1: "—", p2: `read(${resourceName}.status)`, shared: "available", issue: "Both see 'available'!" },
    { time: 2, p1: `write(${resourceName}.status = occupied)`, p2: "—", shared: "occupied", issue: "" },
    { time: 3, p1: "—", p2: `write(${resourceName}.status = occupied)`, shared: "occupied", issue: "DOUBLE BOOKING! Both think they got it." },
    { time: 4, p1: `using ${resourceName}`, p2: `using ${resourceName}`, shared: "occupied", issue: "RACE CONDITION: Two processes in critical section!" },
  ];

  // WITH semaphore — proper synchronization
  const withSync = [
    { time: 0, p1: "sem_wait(mutex) → acquired", p2: "—", shared: "available", semaphore: 0, issue: "" },
    { time: 1, p1: `read(${resourceName}.status) = available`, p2: "sem_wait(mutex) → BLOCKED", shared: "available", semaphore: 0, issue: "P2 waits — semaphore is 0" },
    { time: 2, p1: `write(${resourceName}.status = occupied)`, p2: "still blocked…", shared: "occupied", semaphore: 0, issue: "" },
    { time: 3, p1: "sem_signal(mutex)", p2: "unblocked → acquired", shared: "occupied", semaphore: 0, issue: "P2 now enters critical section" },
    { time: 4, p1: `using ${resourceName} ✓`, p2: `read(${resourceName}.status) = occupied → DENIED`, shared: "occupied", semaphore: 0, issue: "P2 correctly denied. No race condition." },
  ];

  return jsonResponse({
    resource_name: resourceName,
    without_sync: withoutSync,
    with_sync: withSync,
    os_concept_note: "Without synchronization, concurrent reads of shared state cause race conditions. Semaphores enforce mutual exclusion by blocking concurrent access to the critical section.",
  });
}
