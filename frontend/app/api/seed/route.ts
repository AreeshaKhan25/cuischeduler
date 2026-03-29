import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function POST() {
  // Check if already seeded
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    const counts = {
      users: await prisma.user.count(),
      resources: await prisma.resource.count(),
      courses: await prisma.course.count(),
      sections: await prisma.section.count(),
      offerings: await prisma.courseOffering.count(),
      timetableEntries: await prisma.timetableEntry.count(),
    };
    return jsonResponse({ message: "Already seeded", ...counts });
  }

  return jsonResponse({
    message: "Use CLI seed instead: node prisma/seed-direct.mjs",
    instructions: "Run from the frontend directory to seed the database with full SP-26 data.",
  });
}
