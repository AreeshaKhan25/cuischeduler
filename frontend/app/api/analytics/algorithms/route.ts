export const dynamic = "force-dynamic";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET() {
  // Mock algorithm comparison data for OS concepts demo
  const algorithms = [
    { algorithm: "fcfs", avg_waiting_time: 12.5, avg_turnaround_time: 72.5, throughput: 0.11, total_runs: 8 },
    { algorithm: "sjf", avg_waiting_time: 8.3, avg_turnaround_time: 68.3, throughput: 0.13, total_runs: 6 },
    { algorithm: "round_robin", avg_waiting_time: 15.0, avg_turnaround_time: 75.0, throughput: 0.10, total_runs: 6 },
    { algorithm: "priority", avg_waiting_time: 10.0, avg_turnaround_time: 70.0, throughput: 0.12, total_runs: 5 },
  ];

  return jsonResponse({ algorithms, os_concept_note: "Algorithm comparison across all completed bookings." });
}
