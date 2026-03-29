export const dynamic = "force-dynamic";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET() {
  // Mock heatmap data for OS concepts demo
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const hours = Array.from({ length: 16 }, (_, i) => i + 8);

  // Generate realistic-looking mock heatmap (higher usage on weekdays during class hours)
  const matrix = [
    [0, 0.2, 0.6, 0.8, 0.9, 0.7, 0.5, 0.3, 0.6, 0.8, 0.4, 0.2, 0, 0, 0, 0], // Mon
    [0, 0.3, 0.7, 0.9, 1.0, 0.8, 0.6, 0.4, 0.7, 0.9, 0.5, 0.3, 0, 0, 0, 0], // Tue
    [0, 0.2, 0.5, 0.7, 0.8, 0.6, 0.4, 0.3, 0.5, 0.7, 0.3, 0.1, 0, 0, 0, 0], // Wed
    [0, 0.3, 0.6, 0.8, 0.9, 0.7, 0.5, 0.4, 0.6, 0.8, 0.4, 0.2, 0, 0, 0, 0], // Thu
    [0, 0.1, 0.4, 0.6, 0.7, 0.5, 0.3, 0.2, 0.4, 0.5, 0.2, 0.1, 0, 0, 0, 0], // Fri
    [0, 0, 0.1, 0.2, 0.2, 0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],                 // Sat
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],                           // Sun
  ];

  return jsonResponse({ matrix, days, hours, os_concept_note: "Heatmap showing temporal resource demand patterns." });
}
