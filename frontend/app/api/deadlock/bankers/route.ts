import { NextRequest } from "next/server";
import { jsonResponse } from "@/lib/auth-helpers";
import { runBankers } from "@/lib/deadlock-detector";

export async function POST(request: NextRequest) {
  const { processes, resources, max_matrix, allocation_matrix, available } = await request.json();
  const pIds = processes.map((p: { id?: string; process_id?: string }, i: number) => p.id || p.process_id || `P${i}`);
  return jsonResponse(runBankers(pIds, resources, max_matrix, allocation_matrix, available));
}
