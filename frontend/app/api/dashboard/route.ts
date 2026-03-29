export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { jsonResponse, getCurrentUser } from "@/lib/auth-helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);

  // Get active semester
  const semester = await prisma.semester.findFirst({ where: { isActive: true } });
  const semesterId = semester?.id;

  const [
    totalSections,
    totalCourses,
    classrooms,
    labs,
    scheduledClasses,
    pendingRequests,
    totalOfferings,
  ] = await Promise.all([
    prisma.section.count(),
    prisma.course.count(),
    prisma.resource.count({ where: { type: "classroom" } }),
    prisma.resource.count({ where: { type: "lab" } }),
    semesterId ? prisma.timetableEntry.count({ where: { semesterId } }) : Promise.resolve(0),
    semesterId ? prisma.changeRequest.count({ where: { semesterId, status: "pending" } }) : Promise.resolve(0),
    semesterId ? prisma.courseOffering.count({ where: { semesterId } }) : Promise.resolve(0),
  ]);

  // Room utilization: rooms with at least one entry / total rooms
  const usedRooms = semesterId
    ? await prisma.timetableEntry.findMany({
        where: { semesterId },
        select: { resourceId: true },
        distinct: ["resourceId"],
      })
    : [];
  const totalRooms = classrooms + labs;
  const roomUtilization = totalRooms > 0 ? Math.round((usedRooms.length / totalRooms) * 100) : 0;

  // Conflict count (change requests with status 'conflict')
  const conflicts = semesterId
    ? await prisma.changeRequest.count({ where: { semesterId, status: "conflict" } })
    : 0;

  // Recent change requests
  const recentRequests = await prisma.changeRequest.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      requestedBy: { select: { name: true, role: true } },
      timetableEntry: {
        include: {
          courseOffering: { include: { course: true, section: true } },
          resource: true,
        },
      },
    },
  });

  // Role-specific data
  let myScheduleCount = 0;
  let myRequestsCount = 0;
  if (user) {
    if (user.role === "faculty") {
      myScheduleCount = semesterId
        ? await prisma.timetableEntry.count({
            where: { semesterId, courseOffering: { facultyId: user.id } },
          })
        : 0;
    }
    myRequestsCount = await prisma.changeRequest.count({
      where: { requestedById: user.id },
    });
  }

  return jsonResponse({
    semester: semester ? { id: semester.id, code: semester.code, name: semester.name } : null,
    stats: {
      totalSections,
      totalCourses,
      classrooms,
      labs,
      scheduledClasses,
      pendingRequests,
      conflicts,
      roomUtilization,
      totalOfferings,
    },
    recentRequests,
    userStats: {
      myScheduleCount,
      myRequestsCount,
    },
  });
}
