import { NextRequest } from "next/server";
import { getCurrentUser, jsonResponse, errorResponse } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return errorResponse("Not authenticated", 401);
  return jsonResponse({ id: user.id, email: user.email, name: user.name, role: user.role, department: user.department, created_at: user.createdAt });
}
