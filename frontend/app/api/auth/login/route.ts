import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createToken, jsonResponse, errorResponse } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return errorResponse("Email and password are required");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.hashedPassword))) {
    return errorResponse("Incorrect email or password", 401);
  }

  const token = await createToken(user.id);

  return jsonResponse({
    access_token: token,
    token_type: "bearer",
    user: { id: user.id, email: user.email, name: user.name, role: user.role, department: user.department, created_at: user.createdAt },
    os_concept_note: "Authentication successful - JWT token is analogous to a process ID (PID).",
  });
}
