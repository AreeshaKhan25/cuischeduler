import { jsonResponse } from "@/lib/auth-helpers";
export async function GET() { return jsonResponse({ algorithm: "fcfs", os_concept_note: "Current scheduling algorithm: FCFS." }); }
