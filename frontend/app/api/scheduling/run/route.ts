import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";
import { runFcfs, runSjf, runRoundRobin, runPriority } from "@/lib/scheduling-engine";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { algorithm, processes, quantum } = body;

  let data: { id: number; process_id: string; title: string; arrival_time: number; duration_minutes: number; priority: number }[];

  if (processes && Array.isArray(processes) && processes.length > 0) {
    data = processes.map((p: Record<string, unknown>, i: number) => ({
      id: (p.id as number) || i + 1,
      process_id: (p.process_id as string) || `P${i + 1}`,
      title: (p.title as string) || `Process ${i + 1}`,
      arrival_time: (p.arrival_time as number) || 0,
      duration_minutes: (p.burst_time as number) || (p.duration_minutes as number) || 60,
      priority: (p.priority as number) || 5,
    }));
  } else {
    return errorResponse("Provide a 'processes' array (booking_ids no longer supported)");
  }

  const algoMap: Record<string, string> = { fcfs: "fcfs", sjf: "sjf", rr: "round_robin", round_robin: "round_robin", priority: "priority" };
  const algo = algoMap[(algorithm || "fcfs").toLowerCase()] || "fcfs";

  let result;
  if (algo === "fcfs") result = runFcfs(data);
  else if (algo === "sjf") result = runSjf(data);
  else if (algo === "round_robin") result = runRoundRobin(data, quantum || 30);
  else result = runPriority(data);

  return jsonResponse(result);
}
