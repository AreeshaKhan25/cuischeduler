import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  const { resource_id, concurrent_count = 3 } = await req.json();
  const resource = resource_id
    ? await prisma.resource.findUnique({ where: { id: resource_id } })
    : await prisma.resource.findFirst({ where: { type: "lab" } });

  if (!resource) return errorResponse("Resource not found", 404);

  const log: { time: number; process: string; operation: string; result: string; semaphore_count: number; os_note: string }[] = [];
  let semCount = 1;
  let time = 0;
  const processes = Array.from({ length: concurrent_count }, (_, i) => `P${i + 1}`);
  const waitQueue: string[] = [];
  let holder: string | null = null;

  for (const p of processes) {
    time += 1;
    log.push({ time, process: p, operation: "sem_wait()", result: semCount > 0 ? "acquired" : "blocked", semaphore_count: semCount, os_note: semCount > 0 ? `${p} acquires lock. Semaphore decremented.` : `${p} blocked. Semaphore count=0. Added to wait queue.` });

    if (semCount > 0) {
      semCount--;
      holder = p;
      time += 2;
      log.push({ time, process: p, operation: "critical_section", result: "executing", semaphore_count: semCount, os_note: `${p} executing in critical section on ${resource.name}.` });
      time += 1;
      semCount++;
      log.push({ time, process: p, operation: "sem_signal()", result: "released", semaphore_count: semCount, os_note: `${p} releases lock. Semaphore incremented.` });

      if (waitQueue.length > 0) {
        const next = waitQueue.shift()!;
        semCount--;
        log.push({ time, process: next, operation: "sem_wait() unblocked", result: "acquired", semaphore_count: semCount, os_note: `${next} unblocked from wait queue. Enters critical section.` });
      }
      holder = null;
    } else {
      waitQueue.push(p);
    }
  }

  // Process remaining waiters
  for (const p of waitQueue) {
    time += 2;
    semCount--;
    log.push({ time, process: p, operation: "critical_section", result: "executing", semaphore_count: Math.max(0, semCount), os_note: `${p} finally enters critical section.` });
    time += 1;
    semCount++;
    log.push({ time, process: p, operation: "sem_signal()", result: "released", semaphore_count: semCount, os_note: `${p} releases lock.` });
  }

  return jsonResponse({
    resource: { id: resource.id, name: resource.name },
    concurrent_requests: concurrent_count,
    operation_log: log,
    total_operations: log.length,
    os_concept_note: "Semaphore ensures mutual exclusion. Only one process enters the critical section at a time.",
  });
}
