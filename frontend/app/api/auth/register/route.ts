import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createToken, jsonResponse, errorResponse } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, name, password, role, department } = body;

  if (!email || !name || !password) {
    return errorResponse("Email, name, and password are required");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return errorResponse("Email already registered");
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      hashedPassword: await hashPassword(password),
      role: role || "student",
      department: department || "Computer Science",
    },
  });

  const token = await createToken(user.id);

  return jsonResponse({
    access_token: token,
    token_type: "bearer",
    user: { id: user.id, email: user.email, name: user.name, role: user.role, department: user.department, created_at: user.createdAt },
    os_concept_note: "New user process created - like a process being spawned in the OS.",
  });
}
